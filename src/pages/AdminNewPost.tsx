
import React from "react";
import AdminLayout from "@/components/AdminLayout";
import PostEditor from "@/components/PostEditor";

const AdminNewPost: React.FC = () => {
  return (
    <AdminLayout title="Create New Post">
      <PostEditor />
    </AdminLayout>
  );
};

export default AdminNewPost;
