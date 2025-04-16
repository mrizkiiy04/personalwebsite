import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle, Circle, Plus, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

// Define the Todo item type using the Database type
type Todo = Database['public']['Tables']['todos']['Row'];

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch the current user and todos on component mount
  useEffect(() => {
    const fetchUserAndTodos = async () => {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Authentication Error",
            description: "You must be logged in to view your todos",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        setUserId(user.id);
        
        // Fetch todos for the current user
        await fetchTodos(user.id);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error",
          description: "Failed to load your todo list",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchUserAndTodos();
  }, []);
  
  // Function to fetch todos for a user
  const fetchTodos = async (userId: string) => {
    setIsLoading(true);
    try {
      // Check if the todos table exists
      const { error: tableError } = await supabase
        .from('todos')
        .select('id')
        .limit(1);
      
      if (tableError && tableError.message.includes('does not exist')) {
        // Table needs to be created
        await createTodosTable();
      }
      
      // Fetch todos for the user
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setTodos(data || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast({
        title: "Error",
        description: "Failed to load your todo list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to create the todos table if it doesn't exist
  const createTodosTable = async () => {
    try {
      const { error } = await supabase.rpc('create_todos_table');
      
      if (error) throw error;
      
      console.log("Todos table created successfully");
    } catch (error) {
      console.error("Error creating todos table:", error);
      toast({
        title: "Database Error",
        description: "Could not initialize the todos table. Please run the SQL migration file.",
        variant: "destructive",
      });
    }
  };
  
  // Add a new todo
  const addTodo = async () => {
    if (!newTodoTitle.trim() || !userId) return;
    
    try {
      const newTodo = {
        user_id: userId,
        title: newTodoTitle.trim(),
        is_completed: false,
      };
      
      const { data, error } = await supabase
        .from('todos')
        .insert([newTodo])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTodos([data[0], ...todos]);
        setNewTodoTitle("");
        toast({
          title: "Success",
          description: "Todo added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding todo:", error);
      toast({
        title: "Error",
        description: "Failed to add todo",
        variant: "destructive",
      });
    }
  };
  
  // Toggle a todo's completion status
  const toggleTodo = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_completed: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, is_completed: !currentStatus } : todo
      ));
      
      toast({
        title: !currentStatus ? "Completed" : "Marked as incomplete",
        description: !currentStatus ? "Todo marked as complete" : "Todo marked as incomplete",
      });
    } catch (error) {
      console.error("Error updating todo:", error);
      toast({
        title: "Error",
        description: "Failed to update todo status",
        variant: "destructive",
      });
    }
  };
  
  // Delete a todo
  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setTodos(todos.filter(todo => todo.id !== id));
      
      toast({
        title: "Deleted",
        description: "Todo deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Add a new todo..."
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          className="border-2 border-black bg-zinc-700 text-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addTodo();
            }
          }}
        />
        <Button
          onClick={addTodo}
          disabled={!newTodoTitle.trim() || !userId}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
        >
          <Plus className="h-5 w-5 mr-1" /> Add
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-6 text-zinc-400">
          <p>No todos yet. Add some tasks to get started!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center justify-between p-3 rounded-md border-2 border-black ${
                todo.is_completed ? 'bg-zinc-700/50 text-zinc-400' : 'bg-zinc-700 text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleTodo(todo.id, todo.is_completed)}
                  className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    todo.is_completed ? 'text-green-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {todo.is_completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <span className={todo.is_completed ? 'line-through' : ''}>
                  {todo.title}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-300 hover:bg-zinc-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList; 