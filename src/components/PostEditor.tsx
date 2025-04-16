import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form,
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Save,
  ImageIcon, 
  Tags, 
  Search, 
  Eye, 
  Clock, 
  FileText, 
  Plus, 
  Link as LinkIcon,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Terminal,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { marked } from 'marked';
import { generateMarkdownWithGemini } from "@/utils/geminiAi";

// Add marked options for safety
marked.setOptions({
  gfm: true,
  breaks: true
});

// Function to convert HTML to Markdown
const htmlToMarkdown = (html: string): string => {
  // This is a simple conversion, for a complete solution consider using a library like turndown
  let markdown = html;
  
  // Replace common HTML elements with markdown
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n');
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n');
  markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n\n');
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
  markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1\n\n');
  markdown = markdown.replace(/<ul>(.*?)<\/ul>/gs, '$1\n');
  markdown = markdown.replace(/<ol>(.*?)<\/ol>/gs, '$1\n');
  markdown = markdown.replace(/<li>(.*?)<\/li>/g, '- $1\n');
  markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');
  markdown = markdown.replace(/<img src="(.*?)" alt="(.*?)">/g, '![$2]($1)');
  
  // Clean up any remaining tags
  markdown = markdown.replace(/<\/?[^>]+(>|$)/g, '');
  
  return markdown.trim();
};

type PostEditorProps = {
  postId?: string;
  defaultValues?: {
    title?: string;
    content?: string;
    excerpt?: string;
    slug?: string;
    category?: string;
    published?: boolean;
    featured_image?: string;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
  };
};

const PostEditor: React.FC<PostEditorProps> = ({ postId, defaultValues = {} }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues.featured_image || null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [editorMode, setEditorMode] = useState<"rich" | "markdown">("rich");
  const [markdownContent, setMarkdownContent] = useState<string>(htmlToMarkdown(defaultValues.content || ''));
  const [syncingContent, setSyncingContent] = useState<boolean>(false);
  
  // Gemini AI integration state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiDialogOpen, setAiDialogOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
    ],
    content: defaultValues.content || '',
    onUpdate: ({ editor }) => {
      if (!syncingContent) {
        setSyncingContent(true);
        const html = editor.getHTML();
        form.setValue('content', html);
        // Update markdown content when rich editor changes
        if (editorMode === "rich") {
          setMarkdownContent(htmlToMarkdown(html));
        }
        setSyncingContent(false);
      }
    },
  });
  
  const form = useForm({
    defaultValues: {
      title: defaultValues.title || "",
      content: defaultValues.content || "",
      excerpt: defaultValues.excerpt || "",
      slug: defaultValues.slug || "",
      category: defaultValues.category || "tech",
      published: defaultValues.published || false,
      featured_image: defaultValues.featured_image || "",
      seo_title: defaultValues.seo_title || "",
      seo_description: defaultValues.seo_description || "",
      seo_keywords: defaultValues.seo_keywords || ""
    }
  });

  useEffect(() => {
    if (defaultValues.content) {
      editor?.commands.setContent(defaultValues.content);
      setMarkdownContent(htmlToMarkdown(defaultValues.content));
    }
  }, [editor, defaultValues.content]);

  // Handle markdown content changes
  const handleMarkdownChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!syncingContent) {
      setSyncingContent(true);
      const mdContent = e.target.value;
      setMarkdownContent(mdContent);
      
      try {
        // Convert markdown to HTML
        const html = await Promise.resolve(marked.parse(mdContent));
        form.setValue('content', html);
        
        // Update rich editor if it's available
        if (editor && editorMode === "markdown") {
          editor.commands.setContent(html);
        }
      } catch (error) {
        console.error("Error converting markdown to HTML:", error);
      }
      
      setSyncingContent(false);
    }
  };

  // Function to generate content with Gemini AI
  const generateAiContent = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt for the AI to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const generatedContent = await generateMarkdownWithGemini(aiPrompt);
      
      // Update the markdown content with the generated text
      if (editorMode === "markdown") {
        // If in markdown mode, append or replace the content
        setMarkdownContent(prevContent => {
          const newContent = prevContent ? `${prevContent}\n\n${generatedContent}` : generatedContent;
          return newContent;
        });
        
        // Also update the HTML content for the form
        const html = await marked.parse(generatedContent);
        const currentContent = form.getValues('content');
        form.setValue('content', currentContent ? `${currentContent}\n${html}` : html);
        
        // Update rich editor if available
        if (editor) {
          editor.commands.setContent(form.getValues('content'));
        }
      } else {
        // If in rich text mode, first convert markdown to HTML
        const html = await marked.parse(generatedContent);
        
        // Insert at current cursor position or append to end
        if (editor) {
          if (editor.isFocused) {
            // Insert at cursor position
            editor.commands.insertContent(html);
          } else {
            // Append to end
            editor.commands.setContent(editor.getHTML() + html);
          }
          
          // Update form value
          form.setValue('content', editor.getHTML());
          
          // Update markdown content
          setMarkdownContent(htmlToMarkdown(editor.getHTML()));
        }
      }
      
      // Close the dialog and reset the prompt
      setAiDialogOpen(false);
      setAiPrompt('');
      
      toast({
        title: "Content generated",
        description: "AI-generated content has been added to your post.",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      
      // Check for specific error types and provide more helpful messages
      let errorMessage = "An unknown error occurred while generating content.";
      
      if (error instanceof Error) {
        // Extract more helpful error messages
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes("api key")) {
          errorMessage = "Invalid or missing API key. Please check your Gemini API key configuration.";
        } else if (errorText.includes("model") && errorText.includes("not found")) {
          errorMessage = "The Gemini model is not available with your current API key or region. Please ensure you have access to Gemini Pro or try a different API key.";
        } else if (errorText.includes("permission") || errorText.includes("access")) {
          errorMessage = "You don't have permission to use this model. Make sure your API key has access to Gemini AI models.";
        } else if (errorText.includes("network") || errorText.includes("connection")) {
          errorMessage = "Network error while connecting to Gemini API. Please check your internet connection and try again.";
        } else if (errorText.includes("timeout") || errorText.includes("timed out")) {
          errorMessage = "The request to Gemini timed out. Please try again with a shorter prompt.";
        } else {
          // Use the actual error message if available
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error generating content",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .tiptap-editor {
        border: 2px solid #202020;
        border-radius: 6px;
        background-color: #3f3f46;
        color: white;
        padding: 1rem;
        min-height: 300px;
      }
      
      .tiptap-editor:focus {
        outline: none;
        border-color: #3b82f6;
      }
      
      .tiptap-toolbar {
        padding: 0.5rem;
        background-color: #27272a;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        border: 2px solid #202020;
        border-bottom: none;
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }
      
      .ai-button {
        background-color: #7e22ce;
        color: white;
        border: 1px solid #9333ea;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .ai-button:hover {
        background-color: #9333ea;
      }
      
      .ai-dialog {
        background-color: #27272a;
        border: 2px solid #202020;
        border-radius: 6px;
        color: white;
      }
      
      .ai-textarea {
        background-color: #3f3f46;
        border: 2px solid #202020;
        border-radius: 4px;
        color: white;
        padding: 0.5rem;
        width: 100%;
        min-height: 120px;
        resize: vertical;
      }
      
      .tiptap-toolbar button {
        background-color: transparent;
        color: white;
        border: 1px solid #52525b;
        border-radius: 4px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .tiptap-toolbar button:hover {
        background-color: #52525b;
      }
      
      .tiptap-toolbar button.is-active {
        background-color: #3b82f6;
        border-color: #3b82f6;
      }
      
      .tiptap-toolbar .divider {
        width: 1px;
        height: 36px;
        background-color: #52525b;
        margin: 0 0.25rem;
      }
      
      .tiptap p {
        margin: 1em 0;
      }
      
      .tiptap h1 {
        font-size: 1.75em;
        font-weight: bold;
        margin-top: 1em;
        margin-bottom: 0.5em;
      }
      
      .tiptap h2 {
        font-size: 1.5em;
        font-weight: bold;
        margin-top: 1em;
        margin-bottom: 0.5em;
      }
      
      .tiptap ul, .tiptap ol {
        padding-left: 1.5em;
      }
      
      .tiptap img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1em auto;
      }
      
      .text-left {
        text-align: left;
      }
      
      .text-center {
        text-align: center;
      }
      
      .text-right {
        text-align: right;
      }
      
      .text-justify {
        text-align: justify;
      }
      
      .tiptap pre {
        background-color: #1e1e1e;
        color: #e5e5e5;
        font-family: 'JetBrains Mono', monospace;
        padding: 0.75em 1em;
        border-radius: 6px;
        overflow-x: auto;
        margin: 1em 0;
      }
      
      .tiptap code {
        background-color: rgba(30, 30, 30, 0.8);
        color: #e5e5e5;
        font-family: 'JetBrains Mono', monospace;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-size: 0.9em;
      }
      
      .tiptap pre code {
        background-color: transparent;
        padding: 0;
        border-radius: 0;
      }
      
      .tiptap .terminal-code-block {
        background-color: #121212;
        color: #33ff33;
        border-left: 4px solid #33ff33;
      }
      
      .tiptap .language-selector {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background-color: #3f3f46;
        border: 1px solid #202020;
        border-radius: 4px;
        padding: 0.25rem;
        font-size: 0.75rem;
      }
      
      .markdown-editor {
        border: 2px solid #202020;
        border-radius: 6px;
        background-color: #3f3f46;
        color: white;
        padding: 1rem;
        min-height: 300px;
        width: 100%;
        font-family: monospace;
        resize: vertical;
        line-height: 1.5;
      }
      
      .markdown-editor:focus {
        outline: none;
        border-color: #3b82f6;
      }
      
      .editor-tabs {
        margin-bottom: 0.5rem;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const ensureMediaBucketExists = async (): Promise<boolean> => {
    try {
      // Check if the media bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Error checking buckets:", bucketsError);
        throw new Error("Failed to check storage buckets. Please ensure you have the correct permissions.");
      }
      
      const mediaBucket = buckets?.find(b => b.name === 'media');
      
      if (!mediaBucket) {
        console.error("Media bucket not found");
        throw new Error(
          "The 'media' storage bucket does not exist. You need to run the SQL script in the Supabase dashboard SQL editor to create it. Please ask your administrator to execute the 'supabase-fixes.sql' script."
        );
      }
      
      // Test permissions by trying to list files (this will check read permissions)
      const { error: listError } = await supabase.storage.from('media').list();
      if (listError) {
        console.error("Permission error listing files:", listError);
        throw new Error(
          "You don't have permission to access the media storage. Please check the RLS policies in Supabase."
        );
      }
      
      // Test upload permissions with a tiny file
      const testFile = new Blob(['test'], { type: 'text/plain' });
      const testPath = `test-permissions-${Date.now()}.txt`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(testPath, testFile, { upsert: true });
      
      // Clean up the test file regardless of result
      try {
        await supabase.storage.from('media').remove([testPath]);
      } catch (e) {
        console.log("Could not remove test file, but this is not critical");
      }
      
      if (uploadError) {
        console.error("Permission error uploading:", uploadError);
        throw new Error(
          "You don't have permission to upload to the media storage. Please check the RLS policies in Supabase."
        );
      }
      
      return true;
    } catch (error) {
      // Re-throw the error so it can be caught by the upload handlers
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Unknown error checking media storage");
      }
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

      const file = e.target.files[0];
    setImagePreview(null);

    try {
      await ensureMediaBucketExists();
      
      setUploadingMedia(true);
      const filename = `${uuidv4()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('media')
        .upload(`featured/${filename}`, file);

      if (error) {
        throw error;
      }

      if (data) {
        const { data: urlData } = await supabase.storage
          .from('media')
          .getPublicUrl(`featured/${filename}`);

        if (urlData?.publicUrl) {
          setImagePreview(urlData.publicUrl);
          form.setValue("featured_image", urlData.publicUrl);
        } else {
          throw new Error("Failed to get public URL for the uploaded image");
        }
      }
    } catch (error) {
      console.error('Error uploading featured image:', error);
      toast({
        title: 'Error uploading image',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleMediaUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      if (!e.target.files || e.target.files.length === 0 || !editor) {
        return;
      }

      const file = e.target.files[0];
      
      try {
        await ensureMediaBucketExists();
        
        // Set uploading state
        setUploadingMedia(true);
        toast({
          title: 'Uploading media...',
          variant: 'default'
        });

        // Upload the file to Supabase storage
        const filename = `${uuidv4()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('media')
          .upload(`content/${filename}`, file);

        if (error) {
          throw error;
        }

        // Get the public URL
        const { data: urlData } = await supabase.storage
          .from('media')
          .getPublicUrl(`content/${filename}`);

        if (!urlData?.publicUrl) {
          throw new Error("Failed to get public URL for the uploaded image");
        }

        // Add to media URLs for reuse in gallery
        const imageUrl = urlData.publicUrl;
        setMediaUrls(prev => [...prev, imageUrl]);
        
        // Insert image directly into the TipTap editor
        editor.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();

        toast({
          title: 'Media uploaded successfully',
          variant: 'default'
        });
      } catch (error) {
        console.error('Error uploading media:', error);
        toast({
          title: 'Error uploading media',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          variant: 'destructive'
        });
      } finally {
        setUploadingMedia(false);
      }
    };
    input.click();
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    
    if (!form.getValues("slug") || form.getValues("slug") === generateSlug(form.getValues("title"))) {
      form.setValue("slug", generateSlug(title));
    }
    
    if (!form.getValues("seo_title")) {
      form.setValue("seo_title", title);
    }
  };

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    
    toast({
      title: "Link inserted",
      description: "Link has been added to your content.",
    });
  }, [editor]);

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      if (!user) throw new Error("User not authenticated");
      
      // Validate required fields
      if (!values.title || values.title.trim() === '') {
        throw new Error("Post title is required");
      }
      
      if (!values.slug || values.slug.trim() === '') {
        throw new Error("Post slug is required");
      }
      
      // Get the content based on current editor mode
      let finalContent = values.content;
      if (editorMode === "markdown") {
        // Make sure we have the latest HTML version of the markdown
        finalContent = marked.parse(markdownContent);
      } else if (editor) {
        // Get content directly from the editor
        finalContent = editor.getHTML();
      }
      
      // Check that the featured image is a URL and not base64
      let featuredImage = values.featured_image;
      if (featuredImage && featuredImage.startsWith('data:')) {
        // If it's base64, warn the user and handle accordingly
        toast({
          title: "Featured image not uploaded",
          description: "Please upload the featured image properly before saving.",
          variant: "destructive",
        });
        // Set featured_image to null to avoid base64 data in the database
        featuredImage = null;
      }
      
      const postData = {
        title: values.title.trim(),
        slug: values.slug.trim(),
        content: finalContent,
        excerpt: values.excerpt || null,
        category: values.category || "tech",
        published: values.published || false,
        author_id: user.id,
        featured_image: featuredImage,
        seo_title: values.seo_title || values.title.trim(),
        seo_description: values.seo_description || null,
        seo_keywords: values.seo_keywords || null,
      };
      
      console.log("Saving post data:", postData); // Debug logging
      
      // Save the post data
      if (postId) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postId);
          
        if (error) {
          console.error("Supabase update error:", error);
          throw new Error(`Failed to update post: ${error.message}`);
        }
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([postData]);
          
        if (error) {
          console.error("Supabase insert error:", error);
          throw new Error(`Failed to create post: ${error.message}`);
        }
      }
      
      toast({
        title: postId ? "Post updated" : "Post created",
        description: `Your post "${values.title}" has been ${postId ? "updated" : "created"} successfully.`,
      });
      
      navigate("/admin/posts");
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem saving your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const MenuBar = () => {
    if (!editor) {
      return null;
    }
    
    const setTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
      editor.chain().focus().setTextAlign(align).run();
    };

    const isTextAlignActive = (align: string) => {
      return editor.isActive({ textAlign: align });
    };
    
    const addCodeBlock = () => {
      editor.chain().focus().toggleCodeBlock().run();
    };
    
    const addTerminalBlock = () => {
      editor.chain().focus()
        .toggleCodeBlock()
        .updateAttributes('codeBlock', { 
          class: 'terminal-code-block',
          language: 'bash' 
        })
        .run();
        
      toast({
        title: "Terminal code block added",
        description: "You can now paste your terminal commands.",
      });
    };
    
    return (
      <div className="tiptap-toolbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold"
          type="button"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic"
          type="button"
        >
          <Italic size={16} />
        </button>
        
        <div className="divider"></div>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          title="Heading 1"
          type="button"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="Heading 2"
          type="button"
        >
          <Heading2 size={16} />
        </button>
        
        <div className="divider"></div>
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Bullet List"
          type="button"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Ordered List"
          type="button"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          title="Quote"
          type="button"
        >
          <Quote size={16} />
        </button>
        
        <div className="divider"></div>
        
        <button
          onClick={() => setTextAlign('left')}
          className={isTextAlignActive('left') ? 'is-active' : ''}
          title="Align Left"
          type="button"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => setTextAlign('center')}
          className={isTextAlignActive('center') ? 'is-active' : ''}
          title="Align Center"
          type="button"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => setTextAlign('right')}
          className={isTextAlignActive('right') ? 'is-active' : ''}
          title="Align Right"
          type="button"
        >
          <AlignRight size={16} />
        </button>
        <button
          onClick={() => setTextAlign('justify')}
          className={isTextAlignActive('justify') ? 'is-active' : ''}
          title="Justify"
          type="button"
        >
          <AlignJustify size={16} />
        </button>
        
        <div className="divider"></div>
        
        <button
          onClick={addCodeBlock}
          className={editor.isActive('codeBlock') && !editor.isActive('codeBlock', { class: 'terminal-code-block' }) ? 'is-active' : ''}
          title="Code Block"
          type="button"
        >
          <Code size={16} />
        </button>
        <button
          onClick={addTerminalBlock}
          className={editor.isActive('codeBlock', { class: 'terminal-code-block' }) ? 'is-active' : ''}
          title="Terminal Block"
          type="button"
        >
          <Terminal size={16} />
        </button>
        
        <div className="divider"></div>
        
        <button 
          onClick={setLink} 
          className={editor.isActive('link') ? 'is-active' : ''}
          title="Link"
          type="button"
        >
          <LinkIcon size={16} />
        </button>
        <button
          onClick={handleMediaUpload}
          title="Image"
          type="button"
        >
          <ImageIcon size={16} />
        </button>
        
        <div className="divider"></div>
        
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
          type="button"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
          type="button"
        >
          <Redo size={16} />
        </button>
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-zinc-800 p-4 rounded-md border-2 border-black">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-lg font-bold">Title</FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="Add title" 
                      className="text-xl font-bold border-2 border-black bg-zinc-700"
                      {...field}
                      onChange={onTitleChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
              <div className="mt-2 text-sm text-zinc-400">
                <span>Permalink: </span>
                <span className="text-blue-400 hover:underline cursor-pointer">
                  /post/
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <span className="inline-flex items-center">
                        <span className="text-blue-400">{field.value}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1 text-xs text-zinc-400 hover:text-blue-400"
                          onClick={() => {
                            const newSlug = prompt("Edit slug:", field.value);
                            if (newSlug) {
                              form.setValue("slug", generateSlug(newSlug));
                            }
                          }}
                        >
                          Edit
                        </Button>
                      </span>
                    )}
                  />
                </span>
              </div>
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-md border-2 border-black">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <FormLabel className="text-lg font-bold">Content</FormLabel>
                      <div className="flex items-center space-x-2">
                        {/* AI Assistant Button */}
                        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="mr-2 bg-purple-800 hover:bg-purple-700 text-white border-purple-600"
                            >
                              <Sparkles className="mr-1 h-4 w-4" /> AI Assistant
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-800 border-2 border-black text-white">
                            <DialogHeader>
                              <DialogTitle>Generate Content with AI</DialogTitle>
                              <DialogDescription className="text-zinc-400">
                                Enter a prompt and the AI will generate markdown content for your post.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Textarea
                                placeholder="Describe what you'd like the AI to write about..."
                                className="h-32 border-2 border-black bg-zinc-700 text-white placeholder:text-zinc-400"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                              />
                              <div className="text-xs text-zinc-400 mt-2 space-y-1">
                                <p>For best results, be specific about the topic, style, and structure you want.</p>
                                <p>Examples:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                  <li>"Write a tutorial about React useState hook with code examples"</li>
                                  <li>"Create a product comparison between MacBook and Surface laptops"</li>
                                  <li>"Generate a listicle of 5 benefits of meditation with brief explanations"</li>
                                </ul>
                                <p className="mt-2 text-amber-400">
                                  Note: If you encounter model access errors, make sure your API key has access to the Gemini models. 
                                  You may need to <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="underline">sign up for Google AI Studio</a> 
                                  and create a new API key with the appropriate permissions.
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                className="border-zinc-600"
                                onClick={() => setAiDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                className="bg-purple-800 hover:bg-purple-700 text-white"
                                onClick={generateAiContent}
                                disabled={isGenerating || !aiPrompt.trim()}
                              >
                                {isGenerating ? (
                                  <>
                                    <span className="inline-block animate-spin mr-2">↻</span>
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="mr-1 h-4 w-4" /> Generate
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      
                        <Tabs 
                          value={editorMode} 
                          onValueChange={(value) => setEditorMode(value as "rich" | "markdown")}
                          className="editor-tabs"
                        >
                          <TabsList className="bg-zinc-700 border border-zinc-600">
                            <TabsTrigger 
                              value="rich"
                              className={`data-[state=active]:bg-zinc-600 data-[state=active]:text-white`}
                            >
                              Rich Text
                            </TabsTrigger>
                            <TabsTrigger 
                              value="markdown"
                              className={`data-[state=active]:bg-zinc-600 data-[state=active]:text-white`}
                            >
                              <Code className="mr-1 h-4 w-4" /> Markdown
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                    <FormControl>
                      <div className="editor-container">
                        {editorMode === "rich" ? (
                          <>
                            <MenuBar />
                            <EditorContent editor={editor} className="tiptap-editor" />
                          </>
                        ) : (
                          <textarea
                            className="markdown-editor"
                            value={markdownContent}
                            onChange={handleMarkdownChange}
                            placeholder="Write your post in Markdown..."
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-md border-2 border-black">
              <h3 className="text-sm font-medium mb-2">Excerpt</h3>
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Write an excerpt (short summary of your post)..." 
                        className="h-24 border-2 border-black bg-zinc-700"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-zinc-400 mt-1">
                      Excerpts are optional hand-crafted summaries of your content.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-zinc-800 p-4 rounded-md border-2 border-black">
              <h3 className="text-md font-bold mb-3 pb-2 border-b border-zinc-700">Publish</h3>
              
              <div className="space-y-4">
                <div className="text-sm">
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-sm cursor-pointer">Status:</FormLabel>
                          <span>{field.value ? "Published" : "Draft"}</span>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-zinc-700">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-sm border-zinc-600 hover:bg-zinc-700"
                    onClick={() => navigate("/admin/posts")}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium border-none"
                  >
                    {isSubmitting ? "Saving..." : form.getValues("published") ? "Update" : "Publish"}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-md border-2 border-black">
              <h3 className="text-md font-bold mb-3 pb-2 border-b border-zinc-700">Category</h3>
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border border-zinc-600 bg-zinc-700">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border border-zinc-600 bg-zinc-800">
                        <SelectItem value="ai">AI</SelectItem>
                        <SelectItem value="tech">Tech</SelectItem>
                        <SelectItem value="code">Code</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-md border-2 border-black">
              <h3 className="text-md font-bold mb-3 pb-2 border-b border-zinc-700">Featured Image</h3>
              
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Featured image preview" 
                    className="w-full h-40 object-cover rounded-md mb-2"
                  />
                  <div className="flex space-x-2 mt-2">
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-sm border-zinc-600 hover:bg-zinc-700 flex-1"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      Replace
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-sm border-zinc-600 hover:bg-zinc-700 flex-1"
                      onClick={() => {
                        setImagePreview(null);
                        form.setValue("featured_image", "");
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-zinc-600 bg-zinc-700/50 hover:bg-zinc-700 py-6 flex flex-col items-center justify-center"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <ImageIcon className="h-8 w-8 text-zinc-400 mb-2" />
                    <span className="text-sm">Set featured image</span>
                  </Button>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              )}
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-md border-2 border-black">
              <h3 className="text-md font-bold mb-3 pb-2 border-b border-zinc-700 flex items-center gap-2">
                <Search className="h-4 w-4" />
                SEO Settings
              </h3>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="seo_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Meta Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="SEO Title" 
                          className="border border-zinc-600 bg-zinc-700"
                          maxLength={60}
                          {...field}
                        />
                      </FormControl>
                      <div className="text-xs text-zinc-400 mt-1">
                        {field.value.length}/60 characters
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="seo_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Meta Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="SEO Description" 
                          className="border border-zinc-600 bg-zinc-700 h-20"
                          maxLength={160}
                          {...field}
                        />
                      </FormControl>
                      <div className="text-xs text-zinc-400 mt-1">
                        {field.value.length}/160 characters
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="seo_keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Keywords</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Comma-separated keywords" 
                          className="border border-zinc-600 bg-zinc-700"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Media Gallery */}
        {mediaUrls.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-md border-2 border-black mt-4">
            <h3 className="text-md font-bold mb-3">Recent Media</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={url} 
                    alt={`Uploaded media ${index}`} 
                    className="w-full h-20 object-cover rounded-md cursor-pointer"
                    onClick={() => {
                      if (editor) {
                        editor.chain().focus().setImage({ src: url }).run();
                      }
                      toast({
                        title: "Image inserted",
                        description: "Image has been inserted into content",
                      });
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                      <Button 
                        type="button"
                      variant="ghost"
                        size="sm"
                      className="text-white text-xs"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent onClick
                        navigator.clipboard.writeText(url);
                        toast({
                          title: "URL copied",
                          description: "Image URL copied to clipboard",
                        });
                      }}
                    >
                      Copy URL
                      </Button>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </Form>
  );
};

export default PostEditor;
