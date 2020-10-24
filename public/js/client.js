// A reference to Stripe.js initialized with your real test publishable API key.
const stripe = Stripe('PUBLISHABLE_KEY');

const stripeCardStyle = {
    base: {
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: '16px',
        "::placeholder": {
            color: '#32325d'
        }
    },
    invalid: {
        fontFamily: 'Arial, sans-serif',
        color: '#fa755a',
        iconColor: '#fa755a'
    }
};

const donate = {
    items: [{ id: "bear" }]
};

// Disable the button until we have Stripe set up on the page
document.querySelector("button").disabled = true;

fetch("/payments/create", {
    method: 'POST',
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(donate)
})
.then((result) => {
    console.log('result', result);
    return result.json();
})
.then((data) => {
    console.log('data: ', data);
    const elements = stripe.elements();
    let card = elements.create("card", { style: stripeCardStyle });
    
    // Stripe injects an iframe into the DOM
    card.mount("#card-element");
    card.on("change", (event) => {
        // Disable the Pay button if there are no card details in the Element
        document.querySelector("button").disabled = event.empty;
        document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
    });

    const form = document.getElementById("payment-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        // Complete payment when the submit button is clicked
        payWithCard(stripe, card, data.clientSecret);
    });
});

// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
let payWithCard = (stripe, card, clientSecret) => {
    loading(true);
    stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: card }
        })
        .then((result) => {
            if (result.error) {
                showError(result.error.message);
            } else {
                orderComplete(result.paymentIntent.id);
            }
        });
};

// Shows a success message when the payment is complete
let orderComplete = function(paymentIntentId) {
    loading(false);
    document.querySelector(".result-message a")
        .setAttribute("href", "https://dashboard.stripe.com/test/payments/" + paymentIntentId);
    document.querySelector(".result-message").classList.remove("hidden");
    document.querySelector("button").disabled = true;
};

// Show the customer the error from Stripe if their card fails to charge
let showError = (errorMsgText) => {
    loading(false);
    let errorMsg = document.querySelector("#card-error");
    errorMsg.textContent = errorMsgText;
    setTimeout(() => {
        errorMsg.textContent = "";
    }, 4000);
};

// Show a spinner on payment submission
let loading = function(isLoading) {
    if (isLoading) {
        document.querySelector("button").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("button").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
};
