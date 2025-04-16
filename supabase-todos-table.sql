-- Create a todos table
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create an RPC function to create the todos table from client-side code if needed
CREATE OR REPLACE FUNCTION create_todos_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Since we're using security definer, this function will run with the 
    -- privileges of the database user who created it
    CREATE TABLE IF NOT EXISTS public.todos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        is_completed BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
END;
$$;

-- Set up RLS (Row Level Security) for the todos table
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to view only their own todos
CREATE POLICY "Users can view their own todos" ON public.todos
    FOR SELECT USING (auth.uid() = user_id);

-- Create a policy to allow users to insert their own todos
CREATE POLICY "Users can insert their own todos" ON public.todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a policy to allow users to update their own todos
CREATE POLICY "Users can update their own todos" ON public.todos
    FOR UPDATE USING (auth.uid() = user_id);

-- Create a policy to allow users to delete their own todos
CREATE POLICY "Users can delete their own todos" ON public.todos
    FOR DELETE USING (auth.uid() = user_id);

-- Make the todos table available to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.todos TO authenticated; 