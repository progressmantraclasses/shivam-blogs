import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { stateToHTML } from 'draft-js-export-html';
import { useNavigate } from 'react-router-dom';

const Blogs = () => {
    const [title, setTitle] = useState('');
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [author, setAuthor] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [editingBlog, setEditingBlog] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    // Check if the user is logged in (has a token)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true); // User is logged in
        } else {
            setIsLoggedIn(false); // User is not logged in
            navigate('/login'); // Redirect to login page
        }
    }, [navigate]);

    // Fetch all blogs if the user is logged in
    useEffect(() => {
        if (isLoggedIn) {
            axios.get('http://localhost:5000/api/blogs')
                .then(res => setBlogs(res.data))
                .catch(err => console.error('Error fetching blogs:', err));
        }
    }, [isLoggedIn]);

    // Handle Image Upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    // Handle Blog Submission (New & Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const rawContent = JSON.stringify(convertToRaw(editorState.getCurrentContent()));

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', rawContent);
        formData.append('author', author);
        if (image) formData.append('image', image);

        try {
            if (editingBlog) {
                await axios.put(`http://localhost:5000/api/blogs/${editingBlog._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setBlogs(blogs.map(blog => blog._id === editingBlog._id ? { ...blog, title, content: rawContent, author, image } : blog));
                setEditingBlog(null);
            } else {
                const res = await axios.post('http://localhost:5000/api/blogs', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setBlogs([res.data, ...blogs]);
            }

            resetForm();
        } catch (err) {
            console.error('Error submitting blog:', err);
        }
    };

    // Reset Form
    const resetForm = () => {
        setTitle('');
        setEditorState(EditorState.createEmpty());
        setAuthor('');
        setImage(null);
        setPreview(null);
    };

    // Delete Blog
    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Redirect to login if not logged in
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/api/blogs/${id}`);
            setBlogs(blogs.filter(blog => blog._id !== id));
        } catch (err) {
            console.error('Error deleting blog:', err);
        }
    };

    const renderHTMLContent = (content) => {
        try {
            const contentState = convertFromRaw(JSON.parse(content));
            return stateToHTML(contentState);
        } catch (error) {
            console.error('Error converting content:', error);
            return '<p>Error displaying content</p>';
        }
    };

    // Edit Blog
    const handleEdit = (blog) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Redirect to login if not logged in
            return;
        }

        setTitle(blog.title);
        setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(blog.content))));
        setAuthor(blog.author);
        setEditingBlog(blog);
    };

    // Handle Text Formatting
    const handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    };

    const toggleInlineStyle = (style) => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/'); // Redirect to home after logout
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen p-5">
            {/* Navbar */}
            <nav className="w-full bg-gray-800 p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Blog Platform</h1>
                <div>
                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">Logout</button>
                    ) : (
                        <button onClick={() => navigate('/login')} className="bg-green-500 px-4 py-2 rounded">Login</button>
                    )}
                </div>
            </nav>

            {/* Blog Creation Form */}
            {isLoggedIn && (
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-5 bg-gray-800 p-5 rounded-lg">
                    <input
                        type="text"
                        className="w-full p-2 mb-3 bg-gray-700 text-white"
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />

                    <div className="bg-gray-700 p-2 rounded mb-3">
                        <button type="button" className="bg-blue-500 px-2 py-1 rounded mx-1" onClick={() => toggleInlineStyle('BOLD')}>Bold</button>
                        <button type="button" className="bg-green-500 px-2 py-1 rounded mx-1" onClick={() => toggleInlineStyle('ITALIC')}>Italic</button>
                        <button type="button" className="bg-red-500 px-2 py-1 rounded mx-1" onClick={() => toggleInlineStyle('UNDERLINE')}>Underline</button>
                        <button type="button" className="bg-yellow-500 px-2 py-1 rounded mx-1" onClick={() => toggleInlineStyle('STRIKETHROUGH')}>Strikethrough</button>
                    </div>

                    <div className="bg-gray-700 text-white p-3 rounded">
                        <Editor editorState={editorState} onChange={setEditorState} handleKeyCommand={handleKeyCommand} />
                    </div>

                    <input
                        type="text"
                        className="w-full p-2 mt-3 mb-3 bg-gray-700 text-white"
                        placeholder="Author"
                        value={author}
                        onChange={e => setAuthor(e.target.value)}
                    />

                    <input type="file" className="w-full p-2 mb-3 bg-gray-700 text-white" onChange={handleImageChange} />

                    {preview && <img src={preview} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-lg" />}

                    <button type="submit" className="w-full bg-blue-500 p-2 rounded-lg">{editingBlog ? "Update Blog" : "Submit"}</button>
                </form>
            )}

            {/* Display Blogs */}
            <div className="mt-10">
                {blogs.map((blog) => (
                    <div key={blog._id} className="bg-gray-800 p-5 rounded-lg mb-5">
                        <h2 className="text-2xl font-bold">{blog.title}</h2>
                        <p className="text-sm">By {blog.author} on {blog.date || 'Unknown Date'}</p>
                        {blog.image && <img src={`http://localhost:5000/${blog.image}`} alt="Blog" className="mt-2 w-full h-40 object-cover rounded-lg" />}
                        <div className="mt-3" dangerouslySetInnerHTML={{ __html: renderHTMLContent(blog.content) }}></div>

                        <div className="mt-3 flex space-x-3">
                            <button className="bg-green-500 px-3 py-1 rounded" onClick={() => handleEdit(blog)}>Edit</button>
                            <button className="bg-red-500 px-3 py-1 rounded" onClick={() => handleDelete(blog._id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Blogs;
