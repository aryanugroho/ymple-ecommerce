/**
 * Admin/productController
 *
 * @description :: Server-side logic for managing admin/products
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');

module.exports = {

    /**
     * `Admin/productController.new()`
     */
    create: function (req, res) {

        async.waterfall([

            function getNewIdProducT (next) {

                //var data = 1111;

                //console.log('next value 1rst function', data );

                var newIdProduct = CoreReadDbService.getNewIdProduct().then(function(idProduct){

                    console.log('promise return value:', idProduct);

                    return next(null, idProduct);
                });
            },
            /*function GetUserAndOrders (thumbnail, next) {

                console.info('value 2nd function', thumbnail);

                var data2 = 20;

                return next(null, data2);

            },*/

            /*function GetUserAndOrders2 (thumbnail, next) {

                console.info('value 3rd function', thumbnail);
                  var data2 = 20;

                return next(null, data2);

            }*/

        ], function (err, data) {
            if (err) {
                return res.serverError (err);
            }
            else
            {
                console.log('productController - result', data);
                var result = {};
                result.templateToInclude = 'product';
                result.idProduct = data;
                return res.view('back/commun-back/main.ejs', result);
            }
        });
    },

   /*     function (req, res) {
        async.waterfall([
        var newIdProduct = CoreReadDbService.getNewIdProduct('product').then(function(doc){
                    console.log('promise return value:', doc);
            return doc;
            //return res.json({photos: photos.length});
        });*/

    preview: function (req, res) {
        var result = {
            user: (req.session.hasOwnProperty('user')) ? req.session.user : undefined
        };

        async.waterfall([
            function GetProduct(next) {
                Product.findOne(req.params.id, function (err, product) {
                    if (err) return res.serverError(err);
                    if (!product) return res.serverError('NO_PRODUCT_FOUND');
                    // URLIFY
                    //product.description = Urlify(product.description);
                    result.cart = req.session.cart;
                    result.product = product;
                    return next(null, result);
                });
            }
        ], function (err, result) {
            if (err) {res.serverError(err);}
            else {

                result.templateToInclude = 'product_preview';

                return res.view('back/commun-back/main.ejs', result);

            }
        });
    },

    list: function (req, res) {
        var result = {
            admin: req.session.user
        };
        var skip = 0;
        var page = 1;

        if (req.query.hasOwnProperty('page')) {
            skip = (req.query.page - 1) * 10;
            page = req.query.page;
        }

        var queryOptions = {
            where: {},
            skip: skip,
            limit: 10,
            sort: 'createdAt DESC'
        };

        result.page = page;

        async.waterfall([
            function GetTotalCount(next) {
                Product.count(function (err, num) {
                    if (err) return next(err);

                    result.pages = [];

                    for (var i = 0, count = parseInt(num / queryOptions.limit); i <= count; i++) {
                        result.pages.push(i + 1);
                    }

                    return next(null);
                });
            },

            function GetProducts(next) {
                Product.find(queryOptions, function (err, products) {
                    if (err) next(err);

                    result.products = products;

                    return next(null);
                });
            },

            function GetEditProduct(next) {
                if (!req.params.hasOwnProperty('id')) {
                    return next(null);
                    return;
                }

                Product.findOne(req.params.id, function (err, product) {
                    if (err) next(err);
                    result.edit = product;

                    return next(null);
                });
            }
        ], function (err) {
            if (err) return res.serverError(err);
            result.templateToInclude = 'product_list';
            return res.view('back/commun-back/main.ejs', result);
        });
    },

    edit: function (req, res, id) {

        var result = {};
        // we take the id of the product and get all the product details to set the template
        //     console.info('modification product - req: ', req);
        console.info('modification product id: ', req.params.id);
        console.info(req.params.id.length);

        if (req.params.id && (req.params.id.length > 0 )) {
            // we retrieve the product informations
            var productId = req.params.id;
            var queryOptions = {
                where: {id: productId},
                limit: 10,
                sort: 'createdAt DESC'
            };

            Product.find(queryOptions, function (err, products) {
                if (err) next(err);

                result.product = {};
                result.product = products[0];

                if (products[0].idProduct){
                result.idProduct = products[0].idProduct;
                }
                else
                {
                    result.idProduct = 0;
                }

                console.info('edit query result', products);
                console.info('edit - result', result);
                result.templateToInclude = 'product_edit';
                return res.view('back/commun-back/main.ejs', result);
            });

        }
        else {
            result.templateToInclude = 'productModification';
            return res.view('back/commun-back/main.ejs', result);
        }
    },

    deleteConfirmation: function (req, res, id) {

        var result = {};
        console.info('modification product id: ', req.params.id);
        console.info(req.params.id.length);

        if (req.params.id && (req.params.id.length > 0 )) {
            // we retrieve the product informations
            var productId = req.params.id;


            CoreDeleteDbService.deleteProduct(productId);

            result.templateToInclude = 'product_delete_ok';
            return res.view('back/commun-back/main.ejs', result);



        }
        else {
            result.templateToInclude = 'product_list';
            return res.view('back/commun-back/main.ejs', result);
        }
    },



    delete: function (req, res, id) {  // display the delete page for validation

        var result = {};

        //console.info('modification product id: ', req.params.id);
        //console.info(req.params.id.length);

        if (req.params.id && (req.params.id.length > 0 )) {
            // we retrieve the product informations
            var productId = req.params.id;


            result.templateToInclude = 'product_delete';
            result.idProduct = productId;

            return res.view('back/commun-back/main.ejs', result);
        }
    },


    editValidation: function (req, res) {

        console.info('req');
        console.info(req.body);

        if (req && req.body && req.body.name) {
            var data = {};

            data = req.body;

            CoreInsertDbService.updateProduct(data);

            //CoreInsertDbService.incrementId('product');

            var result = {};

            result.templateToInclude = 'product_edit_ok';

            return res.view('back/commun-back/main.ejs', result);

            console.log('productController - productNewValidation - req.body',data );

        }
        else {
            //var result = {};
            //result.templateToInclude = 'product_edit_ok';
            //return res.view('back/commun-back/main.ejs', result);
        }
    },


    productNewValidation: function (req, res) {

        console.info('req');
        console.info(req.body);

        if (req && req.body && req.body.name) {
            var data = {};

            data = req.body;

            CoreInsertDbService.insertProduct(data);

            CoreInsertDbService.incrementId('product');

            var result = {};

            result.templateToInclude = 'productCreationOk';

            return res.view('back/commun-back/main.ejs', result);

            console.log('productController - productNewValidation - req.body',data );

           /* Product.create(data, function (err, product) {
                if (err) {
                    return res.serverError(err);
                }
                else {

                    // once created we increment the id produit in counter table
                    //return res.ok('create of the product done', req.body);
                }
                //return res.redirect('/admin/product');
            });*/
        }
        else {
            var result = {};
            result.templateToInclude = 'productCreationKo';
            return res.view('back/commun-back/main.ejs', result);
            //return res.ok('missing one parameter');
        }
    },

    previewold: function (req, res) {

        console.log ('[start]: productController - preview ');

        var result = {
            user: (req.session.hasOwnProperty('user')) ? req.session.user : undefined
        };

        async.waterfall([
            function GetProduct(next) {
                Product.findOne(req.params.id, function (err, product) {
                    if (err) return res.serverError(err);
                    if (!product) return res.serverError('NO_PRODUCT_FOUND');

                    // URLIFY
                    product.description = Urlify(product.description);

                    result.cart = req.session.cart;
                    result.product = product;

                    return next(null, result);
                });
            }
        ], function (err, result) {
            if (err) {res.serverError(err);}
            else{

            return res.view('back/product/preview.ejs', result);
            }
        });
    },



};

function Urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.replace(urlRegex, function (url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
};

