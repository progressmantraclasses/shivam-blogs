const express = require('express');
const Blog = require('../models/Blog');
const upload = require('../middleware/upload');
const Joi = require('joi');

const router = express.Router();

// Joi Validation Schema
const blogSchema = Joi.object({
    title: Joi.string().min(3).required(),
    content: Joi.string().min(10).required(),
    author: Joi.string().min(3).required()
});

// 🔹 GET: Fetch All Blogs
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ date: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 🔹 POST: Create a New Blog
router.post('/', upload.single('image'), async (req, res) => {
    const { error } = blogSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const newBlog = new Blog({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
            image: req.file ? req.file.path : null
        });
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save blog' });
    }
});

// 🔹 DELETE: Remove a Blog
router.delete('/:id', async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

router.put('/:id', async (req, res) =>{
    try {
        await Blog.findByIdAndUpdate(req.params.id);
        res.json({ message: 'Blog deleted successfully'});
    } catch (err) {
        res.status(500).json({ error: 'Failed to Update'})
    }
})



module.exports = router;
