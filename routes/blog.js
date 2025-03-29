const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// Blog model
const BlogPost = require('../models/BlogPost');

// List all blog posts
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    
    const totalPosts = await BlogPost.countDocuments({ status: 'published' });
    const totalPages = Math.ceil(totalPosts / limit);
    
    const blogPosts = await BlogPost.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name');
    
    res.render('pages/blog/index', {
      title: 'Blog & Resource Center',
      description: 'Learn about cryptocurrency security, wallet management, and recovery tips.',
      blogPosts,
      currentPage: page,
      totalPages,
      totalPosts
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/');
  }
});

// View blog post by slug
router.get('/post/:slug', async (req, res) => {
  try {
    const blogPost = await BlogPost.findOne({
      slug: req.params.slug,
      status: 'published'
    }).populate('author', 'name');
    
    if (!blogPost) {
      req.flash('error_msg', 'Blog post not found');
      return res.redirect('/blog');
    }
    
    // Get related posts with the same category
    const relatedPosts = await BlogPost.find({
      _id: { $ne: blogPost._id },
      category: blogPost.category,
      status: 'published'
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .populate('author', 'name');
    
    res.render('pages/blog/show', {
      title: blogPost.title,
      description: blogPost.excerpt,
      blogPost,
      relatedPosts
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/blog');
  }
});

// List blog posts by category
router.get('/category/:category', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    
    const category = req.params.category;
    
    const totalPosts = await BlogPost.countDocuments({
      status: 'published',
      category
    });
    
    const totalPages = Math.ceil(totalPosts / limit);
    
    const blogPosts = await BlogPost.find({
      status: 'published',
      category
    })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name');
    
    res.render('pages/blog/category', {
      title: `${category} Articles`,
      description: `Articles about ${category} in cryptocurrency and blockchain.`,
      blogPosts,
      category,
      currentPage: page,
      totalPages,
      totalPosts
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/blog');
  }
});

// Search blog posts
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.redirect('/blog');
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    
    const searchRegex = new RegExp(query, 'i');
    
    const totalPosts = await BlogPost.countDocuments({
      status: 'published',
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex }
      ]
    });
    
    const totalPages = Math.ceil(totalPosts / limit);
    
    const blogPosts = await BlogPost.find({
      status: 'published',
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex }
      ]
    })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name');
    
    res.render('pages/blog/search', {
      title: `Search Results for "${query}"`,
      description: `Search results for ${query} in our blog and resource center.`,
      blogPosts,
      query,
      currentPage: page,
      totalPages,
      totalPosts
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/blog');
  }
});

module.exports = router; 