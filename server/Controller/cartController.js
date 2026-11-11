
import Cart from '../Models/Cart.js';
import Product from '../Models/Product.js';

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      customer: req.id
    }).populate('items.product');

    res.status(200).json({
      success: true,
      items: cart ? cart.items : []
    });

  } catch (error) {
    console.log('View cart error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: 'Quantity must be a positive integer'
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    // FIX: Use req.id instead of req.user.id
    let cart = await Cart.findOne({
      customer: req.id
    });

    if (!cart) {
      cart = new Cart({
        customer: req.id,
        items: []
      });
    }

    const item = cart.items.find(
      i => i.product.toString() === productId
    );

    const newQuantity = item
      ? item.quantity + quantity
      : quantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        message: 'Insufficient stock'
      });
    }

    if (item) {
      item.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity
      });
    }

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cart
    });

  } catch (error) {
    console.log('Add to cart error:', error);
    res.status(400).json({
      message: error.message
    });
  }
};


export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({
      customer: req.id
    });

    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }

    const item = cart.items.find(
      i => i.product.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({
        message: 'Cart item not found'
      });
    }

    const product = await Product.findById(
      req.params.productId
    );

    console.log('Product ID:', req.params.productId);
    console.log('Product found:', !!product);
    console.log('Product active:', product?.isActive);
    console.log('Available stock:', product?.stock);
    console.log('Requested quantity:', quantity);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        message: 'This product is inactive'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} items are available`
      });
    }

    item.quantity = quantity;

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart
    });

  } catch (error) {
    console.log('Update cart error:', error);

    res.status(500).json({
      message: error.message
    });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      customer: req.id
    });

    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      i => i.product.toString() !== req.params.productId
    );

    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
