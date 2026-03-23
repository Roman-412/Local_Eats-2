// cart-utils.js - Shared Cart Functionality

async function addToCart(id, title, image, price, rating, description) {
    const userId = localStorage.getItem("user_id");

    // Normalize image path for consistent storage
    let cartImage = image;
    if (image) {
        if (image.startsWith("./assets")) cartImage = "../" + image.substring(2);
        else if (image.startsWith("assets")) cartImage = "../" + image;
        else if (image.startsWith("../../assets")) cartImage = "../" + image.substring(6);
        else if (image.startsWith("../assets")) cartImage = image;

        cartImage = cartImage.replace(/ /g, "%20");
    }

    const isInsideHTML = window.location.pathname.includes('/HTML/');
    let cartPagePath = isInsideHTML ? "addtocard.html" : "HTML/addtocard.html";

    // Deeper folder adjustment
    if (window.location.pathname.includes('/Snacks/') ||
        window.location.pathname.includes('/Breakfast/') ||
        window.location.pathname.includes('/Lunch/') ||
        window.location.pathname.includes('/Diner/') ||
        window.location.pathname.includes('/shops/')) {
        cartPagePath = "../addtocard.html";
    }

    if (userId) {
        try {
            let response = await fetch(`https://backend-2h2s.onrender.com/carts/user/${userId}`);
            let cartId;
            let backendItems = [];

            if (response.ok) {
                const cartData = await response.json();
                cartId = cartData.id;
                backendItems = cartData.items || [];
            } else {
                const newCartRes = await fetch("https://backend-2h2s.onrender.com/carts/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: parseInt(userId),
                        delivery_type: "home",
                        delivery_charge: 30,
                        tip_amount: 0,
                        promo_discount: 0,
                        subtotal: 0,
                        total_amount: 0
                    })
                });

                if (newCartRes.ok) {
                    const newCart = await newCartRes.json();
                    cartId = newCart.id;
                } else if (newCartRes.status === 400) {
                    alert("Session expired or invalid user. Please login again.");
                    localStorage.removeItem("user_id");
                    localStorage.removeItem("username");
                    window.location.href = isInsideHTML ? "Login.html" : "HTML/Login.html";
                    return;
                }
            }

            if (!cartId) throw new Error("Failed to initialize cart");

            // Check if item already exists in backend cart
            const existingItem = backendItems.find(item => item.food_id === id || item.food_title === title);

            if (existingItem) {
                // Update quantity instead of POSTing new item
                const newQty = (existingItem.quantity || 1) + 1;
                const updateRes = await fetch(`https://backend-2h2s.onrender.com/carts/${cartId}/items/${existingItem.id}?quantity=${newQty}`, {
                    method: "PUT"
                });
                if (!updateRes.ok) {
                    throw new Error("Failed to update item quantity in backend");
                }
            } else {
                const itemRes = await fetch(`https://backend-2h2s.onrender.com/carts/${cartId}/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        food_id: id,
                        food_title: title,
                        food_image: cartImage,
                        price: parseFloat(price),
                        quantity: 1
                    })
                });

                if (!itemRes.ok) {
                    const error = await itemRes.json();
                    throw new Error(error.detail || "Failed to add item to backend cart");
                }
            }

            window.location.href = cartPagePath;

        } catch (error) {
            console.error("Error adding to backend cart:", error);
            alert("Failed to add item: " + error.message);
        }
    } else {
        // Local storage logic for guest users
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const exists = cart.find(item => item.title === title);

        if (exists) {
            exists.quantity = (exists.quantity || 1) + 1;
        } else {
            cart.push({
                title: title,
                image: cartImage,
                price: parseFloat(price),
                rating: rating,
                description: description,
                quantity: 1,
                food_id: id
            });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        window.location.href = cartPagePath;
    }
}
