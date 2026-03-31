document.addEventListener("DOMContentLoaded", () => {

  // 🔹 Deployed backend URL
  const API_BASE = "https://srikanthfurniture-production.up.railway.app";
  // 🔹 Fallback products if backend fails
  const fallbackProducts = [
    { name: "Sofa", price: 5000, image: "https://tse2.mm.bing.net/th/id/OIP.zonjMZycVTQ6PMcf2vjqIQHaFj?rs=1&pid=ImgDetMain&o=7&rm=3" },
    { name: "Dining Table", price: 3000, image: "https://thumbs.dreamstime.com/b/modern-dining-table-set-white-dishes-glassware-bright-clean-interior-contemporary-design-neutral-colors-332092613.jpg" },
    { name: "Bed", price: 4000, image: "https://tse1.mm.bing.net/th/id/OIP.kWKhP-xIf4jLxNLo3RETOwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" },
    { name: "Chair", price: 800, image: "https://ik.imagekit.io/2xkwa8s1i/img/npl_raw_images/Revamp/WDINEARVWOAC1MBBK/WDINEARVWOAC1MBBK-1.jpg?tr=w-640" },
    { name:"bookshelf", price:1500, image:"https://tse1.mm.bing.net/th/id/OIP.b8CK17bhgM6AwOihQfZM1AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"},
    { name:"Bedside table", price:750, image:"https://ik.imagekit.io/2xkwa8s1i/img/npl_modified_images/WSTV/WSBDIDRIS/WSBDIDRIS_LS_1.jpg?tr=w-640"},
    { name:"TV stand", price:680, image:"https://th.bing.com/th/id/OIP.RK2oR99xL1mzk4C4dG7lyQHaHa?w=211&h=211&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"},
    { name:"Refrigerator", price:5000, image:"https://tse2.mm.bing.net/th/id/OIP.gkyVxV49VC8P2DoyAH223QHaJd?rs=1&pid=ImgDetMain&o=7&rm=3"},
    { name:"Microwave", price:200, image:"https://tse3.mm.bing.net/th/id/OIP.ieG6sc693PZrqNgYC6AL6gHaFp?rs=1&pid=ImgDetMain&o=7&rm=3"},
    { name:"Air cooler", price:3000, image:"https://m.media-amazon.com/images/I/61XfqhiA-RL.jpg"},
    { name:"Shoe rack", price:1000, image:"https://m.media-amazon.com/images/I/816PbBEdILL._SL1500_.jpg"},
    { name:"Dressing table", price:2000, image:"https://tse2.mm.bing.net/th/id/OIP.FgDDC6lIwNOWNQahYJiunwHaGa?rs=1&pid=ImgDetMain&o=7&rm=3"},
    { name:"Storage cabinet", price:5000, image:"https://tse3.mm.bing.net/th/id/OIP.uuAOVHRu47XvroPpEC_52gHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"},
    { name:"Towel racks", price:850, image:"https://tse1.mm.bing.net/th/id/OIP.ROYE9ZHg5a-B5JVYLq82tgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"},
    { name:"Table lamps", price:2500, image:"https://tse3.mm.bing.net/th/id/OIP.rLdfbqdYi_u4wFoEBKK0hAHaGa?rs=1&pid=ImgDetMain&o=7&rm=3"},
    { name:"Table fan", price:1500, image:"https://tse4.mm.bing.net/th/id/OIP.-DiDyLoOQQbQKb6_6OfzDAHaKA?w=1849&h=2500&rs=1&pid=ImgDetMain&o=7&rm=3"},
    { name:"Gas stove", price:3450, image:"https://tse4.mm.bing.net/th/id/OIP.ErtsjeTPAW4DS5M6OXB7MwHaCc?rs=1&pid=ImgDetMain&o=7&rm=3"},
    { name:"Mixer", price:3200, image:"https://m.media-amazon.com/images/I/511ODG4v4GL._AC_SS450_.jpg"},
    { name:"Laundry basket", price:300, image:"https://images.woodenstreet.de/image/data/jasmey-homes/hand-crafted-jute-and-cotton-laundry-basket-white/White/1.jpg"},
    { name:"Fan", price:1400, image:"https://tse4.mm.bing.net/th/id/OIP.XD7hERA_EUYHIcOH-PooJAHaEO?rs=1&pid=ImgDetMain&o=7&rm=3"}
  ];

  // 🔹 DOM elements
   // 🔹 DOM elements
  const container = document.getElementById("products");
  const searchBar = document.getElementById("searchBar");
  const modal = document.getElementById("rent-modal");
  const modalName = document.getElementById("modal-product-name");
  const modalPriceText = document.getElementById("modal-price-text");
  const rentDuration = document.getElementById("rent-duration");
  const confirmBtn = document.getElementById("confirm-rent-btn");
  const cancelBtn = document.getElementById("cancel-rent-btn");
  const rentEmail = document.getElementById("rent-email");
  const rentOtp = document.getElementById("rent-otp");
  const sendOtpBtn = document.getElementById("send-otp-btn");

  let selectedProduct = null;
  let allProducts = [];

  // 🔹 Display products
  function displayProducts(list) {
    if (!container) return;
    container.innerHTML = "";

    list.forEach(product => {
      const card = document.createElement("div");
      card.classList.add("product-card");
      card.innerHTML = `
        <img src="${product.image}" width="200">
        <h2>${product.name}</h2>
        <p>₹${product.price} / month</p>
        <button class="rent-btn">Rent Now</button>
      `;
      container.appendChild(card);

      card.querySelector(".rent-btn").addEventListener("click", () => {
        selectedProduct = product;
        modalName.textContent = product.name;
        modalPriceText.textContent = `₹${product.price} / month`;
        rentDuration.value = 1;
        rentEmail.value = "";
        rentOtp.value = "";
        confirmBtn.disabled = true;
        modal.style.display = "flex";
      });
    });
  }

  // 🔹 Load products from backend or fallback
  async function loadProducts() {
    allProducts = fallbackProducts;
    displayProducts(allProducts);

    try {
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        allProducts = data;
        displayProducts(allProducts);
      }
    } catch (err) {
      console.warn("Backend failed, using fallback");
    }
  }

  // 🔹 Search products
  if (searchBar) {
    searchBar.addEventListener("input", e => {
      const query = e.target.value.toLowerCase();
      const filtered = allProducts.filter(p => p.name.toLowerCase().includes(query));
      displayProducts(filtered);
    });
  }

  // 🔹 Send OTP
  sendOtpBtn.addEventListener("click", async () => {
    if (!rentEmail.value) { alert("Enter email first"); return; }

    try {
      const res = await fetch(`${API_BASE}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: rentEmail.value })
      });
      const data = await res.json();
      if (res.ok) { alert("OTP sent to your email 📩"); confirmBtn.disabled = false; }
      else { alert("❌ " + data.message); }
    } catch (err) { console.error(err); alert("OTP failed"); }
  });

  // 🔹 Confirm Rent
  confirmBtn.addEventListener("click", async () => {
    if (!selectedProduct) { alert("Select product first"); return; }
    if (!rentEmail.value || !rentOtp.value) { alert("Enter email and OTP"); return; }

    const duration = parseInt(rentDuration.value);

    try {
      const res = await fetch(`${API_BASE}/api/rent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct._id ? selectedProduct._id : selectedProduct.name,
          duration: duration,
          email: rentEmail.value,
          otp: rentOtp.value,
          price: selectedProduct.price
        })
      });

      const data = await res.json();

      if (res.ok) {
  alert("Your OTP is: " + data.otp);
  confirmBtn.disabled = false;
} else {
  alert("❌ " + data.message);
}

    } catch (err) { 
      console.error(err); 
      alert("Server error"); 
    }
  });

  // 🔹 Cancel modal
  cancelBtn.addEventListener("click", () => { modal.style.display = "none"; });

  // 🔹 Initialize
  loadProducts();

});




//   const container = document.getElementById("products-container");
//   const searchBar = document.getElementById("search-bar");
//   const modal = document.getElementById("rent-modal");
//   const modalName = document.getElementById("modal-product-name");
//   const modalPriceText = document.getElementById("modal-price-text");
//   const rentDuration = document.getElementById("rent-duration");
//   const confirmBtn = document.getElementById("confirm-rent-btn");
//   const cancelBtn = document.getElementById("cancel-rent-btn");
// const rentEmail = document.getElementById("rent-email");
//   let selectedProduct = null;
//   let allProducts = [];

//   // Display products
//   function displayProducts(list) {
//     container.innerHTML = "";
//     list.forEach(product => {
//       const card = document.createElement("div");
//       card.classList.add("product-card");

//       card.innerHTML = `
//         <img src="${product.image}" alt="${product.name}" width="200">
//         <h2>${product.name}</h2>
//         <p>₹${product.price} / month</p>
//         <button class="rent-btn">Rent Now</button>
//       `;

//       container.appendChild(card);

//       card.querySelector(".rent-btn").addEventListener("click", () => {
//         selectedProduct = product;
//         modalName.textContent = product.name;
//         modalPriceText.textContent = `₹${product.price} / month`;
//         rentDuration.value = 1;

//         clearModalMessages();
//         modal.style.display = "flex";
//         confirmBtn.style.display = "inline-block";
//       });
//     });
//   }

//   // Load products from backend or fallback
//   // Load products from backend or fallback
// async function loadProducts() {
//   // ✅ Show fallback instantly
//   allProducts = fallbackProducts;
//   displayProducts(allProducts);

//   try {
//     const res = await fetch("http://localhost:5000/api/products");
//     const data = await res.json();

//     if (Array.isArray(data) && data.length > 0) {
//       // ✅ Replace with backend data if available
//       allProducts = data;
//       displayProducts(allProducts);
//     } else {
//       console.warn("Backend empty, keeping fallback products");
//     }
//   } catch (err) {
//     console.error("Error fetching products, keeping fallback:", err);
//     // ✅ Fallback already displayed, so nothing else to do
//   }
// }

//   // Search functionality
//   searchBar.addEventListener("input", (e) => {
//     const query = e.target.value.toLowerCase();
//     const filtered = allProducts.filter(p =>
//       p.name.toLowerCase().includes(query)
//     );
//     displayProducts(filtered);
//   });

//   // Clear old modal messages/buttons
//   function clearModalMessages() {
//     ["success-message", "proceed-btn", "error-message"].forEach(id => {
//       const el = document.getElementById(id);
//       if (el) el.remove();
//     });
//   }

//   // Confirm Rent
//   confirmBtn.addEventListener("click", async () => {
//     clearModalMessages();

//     if (!selectedProduct) {
//       const msg = document.createElement("p");
//       msg.id = "error-message";
//       msg.style.color = "red";
//       msg.style.fontWeight = "bold";
//       msg.textContent = "Please select a product first!";
//       document.getElementById("rent-modal-content").appendChild(msg);
//       return;
//     }





// const duration = parseInt(rentDuration.value);

//     try {
//       const res = await fetch("http://localhost:5000/api/rent", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           productId: selectedProduct._id || selectedProduct.name, // fallback if no _id
//           duration: duration,
//           email: "test@example.com" // replace with user input later
//         })
//       });

//       const data = await res.json();
//       confirmBtn.style.display = "none";

//       const msg = document.createElement("p");
//       msg.id = "success-message";
//       msg.style.color = "green";
//       msg.style.fontWeight = "bold";
//       msg.textContent = `${data.message || "Rent successful!"} Total ₹${data.totalPrice || selectedProduct.price * duration}`;
//       document.getElementById("rent-modal-content").appendChild(msg);

//       const proceedBtn = document.createElement("button");
//       proceedBtn.id = "proceed-btn";
//       proceedBtn.textContent = "Proceed to Payment";
//       proceedBtn.style.marginTop = "10px";
//       proceedBtn.addEventListener("click", () => {
//         window.open("payment.html", "_blank");
//         modal.style.display = "none";
//       });
//       document.getElementById("rent-modal-content").appendChild(proceedBtn);

//     } catch (err) {
//       console.error("Error renting:", err);
//       const errMsg = document.createElement("p");
//       errMsg.id = "error-message";
//       errMsg.style.color = "red";
//       errMsg.style.fontWeight = "bold";
//       errMsg.textContent = "Error renting. Try again!";
//       document.getElementById("rent-modal-content").appendChild(errMsg);
//     }
//   });

//   // Cancel button
//   cancelBtn.addEventListener("click", () => {
//     modal.style.display = "none";
//   });

//   // Load products on start
//   loadProducts();
// });
























