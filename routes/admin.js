const express = require('express');
const router = express.Router();
const createDomPurify = require('dompurify');
const marked = require('marked');
const { JSDOM } = require('jsdom');
const dompurify = createDomPurify(new JSDOM().window);
const ArticleModel = require('../models/article');

router.get('/home', (req, res) => {
    session = req.session;
    res.locals.session = req.session;
    ArticleModel.find(function(err, data) {
        if(err){
            res.render('admin/dashboard', { articles: [] });
        }
        else {
            res.render('admin/dashboard', { articles: data });
        }
    });
});

router.get('/create-article', (req, res) => {
    res.render('admin/create-article');
});

router.post('/create-article', (req, res) => {
    const Article = new ArticleModel({
        title: req.body.title,
        url: req.body.title.replace(/\s+/g, '-').toLowerCase(),
        content: req.body.content,
        contentSanitize: dompurify.sanitize(marked(req.body.content))
    });

    Article.save(function(err, data){
        if(err) {
            res.render('admin/create-article', { success: false, message: 'Article failed to add!' });
        }
        else{
            res.render('admin/create-article', { success: true, message: 'Article added Successfully' });
        }
    })
});

router.get('/article/edit/:id', (req, res) => {
    ArticleModel.findById(req.params.id, function(err, data){
        if(err){
            res.render('admin/update-article', { success: false, message: 'Article failed to load! Please Back and Open Again!' });
        }
        else {
            res.render('admin/update-article', { article: data });
        }
    })
});

router.post('/article/edit/:id', (req, res) => {
    ArticleModel.updateOne({ _id: req.params.id }, {
        title: req.body.title,
        content: req.body.content,
        contentSanitize: dompurify.sanitize(marked(req.body.content))
    }, function(err, data){
        if(err){
            res.redirect('/home/article/edit/'+req.params.id);
        }
        else {
            res.redirect('/admin/home');
        }
    })
});

router.get('/article/delete/:id', (req, res) => {
    ArticleModel.deleteOne({_id: req.params.id}, function(err, data){
        if(err){
            res.redirect('/admin/home');
        }
        else {
            res.redirect('/admin/home');
        }
    })
});

module.exports = router;