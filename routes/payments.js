var express = require('express');
var router = express.Router();

const MINIMUM_AMOUNT = 2000;
const DEFAULT_CURRENCY = 'usd';
const Stripe = require('stripe');
const stripe = Stripe('SECRET_KEY');

const calculateAmount = items => {
    const num = items ? items.length : 1;
    return num * MINIMUM_AMOUNT;
};

// Create payment intent
router.post('/create', async (req, res) => {
    
    try {
        const { items } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: calculateAmount(items),
          currency: DEFAULT_CURRENCY
        });

        res.send({
          clientSecret: paymentIntent.client_secret
        });
    } catch (err) {
        console.log('error: ', err);
        res.send(err);
    }
});

module.exports = router;
