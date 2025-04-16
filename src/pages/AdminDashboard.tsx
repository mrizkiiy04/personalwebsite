import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, UserCheck, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";
import TodoList from "@/components/TodoList";

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/posts">
          <Card className="border-4 border-black bg-zinc-700 text-white hover:bg-zinc-600 transition-colors cursor-pointer">
            <CardHeader className="bg-cyan-400 text-black border-b-4 border-black">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Posts Management
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>Create, edit and manage your blog posts.</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/admin/profile">
          <Card className="border-4 border-black bg-zinc-700 text-white hover:bg-zinc-600 transition-colors cursor-pointer">
            <CardHeader className="bg-pink-400 text-black border-b-4 border-black">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>Update your profile, avatar, and email.</p>
            </CardContent>
          </Card>
        </Link>
        
        <Card className="border-4 border-black bg-zinc-700 text-white">
          <CardHeader className="bg-emerald-400 text-black border-b-4 border-black">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              To-Do List
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="mb-4">Manage your tasks and stay organized.</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 bg-zinc-800 p-6 rounded-lg border-4 border-black">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-emerald-400" />
          Task Manager
        </h2>
        <TodoList />
      </div>
      
      <div className="mt-8 p-4 bg-zinc-700 rounded-lg border-2 border-zinc-600">
        <h2 className="text-lg font-bold mb-2">Quick Tips</h2>
        <ul className="list-disc list-inside space-y-2 text-zinc-300">
          <li>Use the <span className="text-pink-400">Profile</span> section to update your avatar.</li>
          <li>Create posts with proper SEO tags in the <span className="text-cyan-400">Posts</span> section.</li>
          <li>Add tasks to your <span className="text-emerald-400">To-Do List</span> to track your work.</li>
        </ul>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
