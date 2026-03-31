require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ----------------------
// Schemas
// ----------------------
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String
});

const rentSchema = new mongoose.Schema({
  productName: String,
  email: String,
  duration: Number,
  totalPrice: Number,
  date: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", productSchema);
const Rent = mongoose.model("Rent", rentSchema);

// ----------------------
// Sample products
// ----------------------
const products = [
  { name: "Sofa", price: 5000, image: "https://tse2.mm.bing.net/th/id/OIP.zonjMZycVTQ6PMcf2vjqIQHaFj?rs=1&pid=ImgDetMain&o=7&rm=3" },
  { name: "Dining Table", price: 3000, image: "https://thumbs.dreamstime.com/b/modern-dining-table-set-white-dishes-glassware-bright-clean-interior-contemporary-design-neutral-colors-332092613.jpg" },
  { name: "Bed", price: 4000, image: "https://tse1.mm.bing.net/th/id/OIP.kWKhP-xIf4jLxNLo3RETOwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" },
  { name: "Chair", price: 800, image: "https://ik.imagekit.io/2xkwa8s1i/img/npl_raw_images/Revamp/WDINEARVWOAC1MBBK/WDINEARVWOAC1MBBK-1.jpg?tr=w-640" },
  { name:"Bookshelf", price:1500, image:"https://tse1.mm.bing.net/th/id/OIP.b8CK17bhgM6AwOihQfZM1AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"},
  { name:"Bedside Table", price:750, image:"https://ik.imagekit.io/2xkwa8s1i/img/npl_modified_images/WSTV/WSBDIDRIS/WSBDIDRIS_LS_1.jpg?tr=w-640"},
  { name:"TV Stand", price:680, image:"https://th.bing.com/th/id/OIP.RK2oR99xL1mzk4C4dG7lyQHaHa?w=211&h=211&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"},
  { name:"Refrigerator", price:5000, image:"https://tse2.mm.bing.net/th/id/OIP.gkyVxV49VC8P2DoyAH223QHaJd?rs=1&pid=ImgDetMain&o=7&rm=3"},
  { name:"Microwave", price:200, image:"https://tse3.mm.bing.net/th/id/OIP.ieG6sc693PZrqNgYC6AL6gHaFp?rs=1&pid=ImgDetMain&o=7&rm=3"},
  { name:"Air Cooler", price:3000, image:"https://m.media-amazon.com/images/I/61XfqhiA-RL.jpg"},
  { name:"Shoe Rack", price:1000, image:"https://m.media-amazon.com/images/I/816PbBEdILL._SL1500_.jpg"},
  { name:"Dressing Table", price:2000, image:"https://tse2.mm.bing.net/th/id/OIP.FgDDC6lIwNOWNQahYJiunwHaGa?rs=1&pid=ImgDetMain&o=7&rm=3"},
  { name:"Storage Cabinet", price:5000, image:"https://tse3.mm.bing.net/th/id/OIP.uuAOVHRu47XvroPpEC_52gHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"},
  { name:"Towel Racks", price:850, image:"https://tse1.mm.bing.net/th/id/OIP.ROYE9ZHg5a-B5JVYLq82tgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"},
  { name:"Table Lamps", price:2500, image:"https://tse3.mm.bing.net/th/id/OIP.rLdfbqdYi_u4wFoEBKK0hAHaGa?rs=1&pid=ImgDetMain&o=7&rm=3"},
  { name:"Table Fan", price:1500, image:"https://tse4.mm.bing.net/th/id/OIP.-DiDyLoOQQbQKb6_6OfzDAHaKA?w=1849&h=2500&rs=1&pid=ImgDetMain&o=7&rm=3"},
  { name:"Gas Stove", price:3450, image:"https://tse4.mm.bing.net/th/id/OIP.ErtsjeTPAW4DS5M6OXB7MwHaCc?rs=1&pid=ImgDetMain&o=7&rm=3"},
  { name:"Mixer", price:3200, image:"https://m.media-amazon.com/images/I/511ODG4v4GL._AC_SS450_.jpg"},
  { name:"Laundry Basket", price:300, image:"https://images.woodenstreet.de/image/data/jasmey-homes/hand-crafted-jute-and-cotton-laundry-basket-white/White/1.jpg"},
  { name:"Fan", price:1400, image:"https://tse4.mm.bing.net/th/id/OIP.XD7hERA_EUYHIcOH-PooJAHaEO?rs=1&pid=ImgDetMain&o=7&rm=3"}
];

// ----------------------
// Connect MongoDB Atlas
// ----------------------
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Atlas Connected");

    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(products);
      console.log("🔥 Sample products inserted");
    }
  })
  .catch(err => console.log("❌ MongoDB connection error:", err));

// ----------------------
// OTP Store
// ----------------------
let otpStore = {};

// ----------------------
// Mail Setup
// ----------------------
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "SET" : "NOT SET");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ----------------------
// Send Confirmation Mail (Safe)
// ----------------------
async function sendConfirmationEmail(email, productName, totalPrice, duration) {
  try {
    await transporter.sendMail({
      from: `"RentEase" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Rent Confirmation",
      html: `
        <h2>Rent Confirmed ✅</h2>
        <p><b>Product:</b> ${productName}</p>
        <p><b>Duration:</b> ${duration} months</p>
        <p><b>Total Price:</b> ₹${totalPrice}</p>
      `
    });
    console.log("✅ Confirmation email sent to", email);
  } catch (err) {
    console.warn("⚠️ Email not sent:", err.message);
  }
}

// ----------------------
// Send OTP
// ----------------------
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: `"RentEase" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for RentEase",
      text: `Your OTP is: ${otp}`
    });

    res.status(200).json({ message: "OTP sent" });

  } catch (err) {
    console.error(err);

    // 🔥 IMPORTANT CHANGE
    res.status(200).json({ 
      message: "Email failed but OTP generated",
      otp: otp
    });
  }
});

// ----------------------
// Rent API
// ----------------------
app.post("/api/rent", async (req, res) => {
  try {
    const { productId, duration, email, otp } = req.body;

    // OTP verify
    if (!otpStore[email] || otpStore[email] !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    delete otpStore[email];

    // Product fetch
    let product = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }
    if (!product) product = { name: productId, price: 1000 };

    const totalPrice = product.price * duration;

    await Rent.create({
      productName: product.name,
      email,
      duration,
      totalPrice
    });

    // 🔹 Safe email sending
    await sendConfirmationEmail(email, product.name, totalPrice, duration);

    res.status(200).json({ message: "Rent successful", totalPrice });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------
// Get Products
// ----------------------
app.get("/api/products", async (req, res) => {
  try {
    const data = await Product.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// ----------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});











// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const nodemailer = require("nodemailer");

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// // ----------------------
// // Schemas
// // ----------------------
// const productSchema = new mongoose.Schema({
//   name: String,
//   price: Number,
//   image: String
// });

// const rentSchema = new mongoose.Schema({
//   productName: String,
//   email: String,
//   duration: Number,
//   totalPrice: Number,
//   date: { type: Date, default: Date.now }
// });

// const Product = mongoose.model("Product", productSchema);
// const Rent = mongoose.model("Rent", rentSchema);


// // ----------------------
// // Sample products
// // ----------------------
// const products = [
//    { name: "Sofa", price: 5000, image: "https://tse2.mm.bing.net/th/id/OIP.zonjMZycVTQ6PMcf2vjqIQHaFj?rs=1&pid=ImgDetMain&o=7&rm=3" },
//   { name: "Dining Table", price: 3000, image: "https://thumbs.dreamstime.com/b/modern-dining-table-set-white-dishes-glassware-bright-clean-interior-contemporary-design-neutral-colors-332092613.jpg" },
//   { name: "Bed", price: 4000, image: "https://tse1.mm.bing.net/th/id/OIP.kWKhP-xIf4jLxNLo3RETOwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" },
//   { name: "Chair", price: 800, image: "https://ik.imagekit.io/2xkwa8s1i/img/npl_raw_images/Revamp/WDINEARVWOAC1MBBK/WDINEARVWOAC1MBBK-1.jpg?tr=w-640" },
//   { name:"Bookshelf", price:1500, image:"https://tse1.mm.bing.net/th/id/OIP.b8CK17bhgM6AwOihQfZM1AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"},
//   { name:"Bedside Table", price:750, image:"https://ik.imagekit.io/2xkwa8s1i/img/npl_modified_images/WSTV/WSBDIDRIS/WSBDIDRIS_LS_1.jpg?tr=w-640"},
//   { name:"TV Stand", price:680, image:"https://th.bing.com/th/id/OIP.RK2oR99xL1mzk4C4dG7lyQHaHa?w=211&h=211&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"},
//   { name:"Refrigerator", price:5000, image:"https://tse2.mm.bing.net/th/id/OIP.gkyVxV49VC8P2DoyAH223QHaJd?rs=1&pid=ImgDetMain&o=7&rm=3"},
//   { name:"Microwave", price:200, image:"https://tse3.mm.bing.net/th/id/OIP.ieG6sc693PZrqNgYC6AL6gHaFp?rs=1&pid=ImgDetMain&o=7&rm=3"},
//   { name:"Air Cooler", price:3000, image:"https://m.media-amazon.com/images/I/61XfqhiA-RL.jpg"},
//   { name:"Shoe Rack", price:1000, image:"https://m.media-amazon.com/images/I/816PbBEdILL._SL1500_.jpg"},
//   { name:"Dressing Table", price:2000, image:"https://tse2.mm.bing.net/th/id/OIP.FgDDC6lIwNOWNQahYJiunwHaGa?rs=1&pid=ImgDetMain&o=7&rm=3"},
//   { name:"Storage Cabinet", price:5000, image:"https://tse3.mm.bing.net/th/id/OIP.uuAOVHRu47XvroPpEC_52gHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"},
//   { name:"Towel Racks", price:850, image:"https://tse1.mm.bing.net/th/id/OIP.ROYE9ZHg5a-B5JVYLq82tgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"},
//   { name:"Table Lamps", price:2500, image:"https://tse3.mm.bing.net/th/id/OIP.rLdfbqdYi_u4wFoEBKK0hAHaGa?rs=1&pid=ImgDetMain&o=7&rm=3"},
//   { name:"Table Fan", price:1500, image:"https://tse4.mm.bing.net/th/id/OIP.-DiDyLoOQQbQKb6_6OfzDAHaKA?w=1849&h=2500&rs=1&pid=ImgDetMain&o=7&rm=3"},
//   { name:"Gas Stove", price:3450, image:"https://tse4.mm.bing.net/th/id/OIP.ErtsjeTPAW4DS5M6OXB7MwHaCc?rs=1&pid=ImgDetMain&o=7&rm=3"},
//   { name:"Mixer", price:3200, image:"https://m.media-amazon.com/images/I/511ODG4v4GL._AC_SS450_.jpg"},
//   { name:"Laundry Basket", price:300, image:"https://images.woodenstreet.de/image/data/jasmey-homes/hand-crafted-jute-and-cotton-laundry-basket-white/White/1.jpg"},
//   { name:"Fan", price:1400, image:"https://tse4.mm.bing.net/th/id/OIP.XD7hERA_EUYHIcOH-PooJAHaEO?rs=1&pid=ImgDetMain&o=7&rm=3"}
// ];


// // ----------------------
// // Connect MongoDB

// mongoose.connect("mongodb://127.0.0.1:27017/furnitureDB")
//   .then(async () => {
//     console.log("✅ MongoDB Connected");

//     const count = await Product.countDocuments();
//     if (count === 0) {
//       await Product.insertMany(products);
//       console.log("🔥 Sample products inserted");
//     }
//   })
//   .catch(err => console.log(err));

// // ----------------------
// // OTP Store
// // ----------------------
// let otpStore = {};

// // ----------------------
// // Mail Setup
// // ----------------------
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "furniturerent2026@gmail.com",
//     pass: "jzokgdfkdludgere"
//   }
// });

// // ----------------------
// // Send OTP
// // ----------------------
// app.post("/api/send-otp", async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ message: "Email required" });
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   otpStore[email] = otp;

//   try {
//     await transporter.sendMail({
//       from: "RentEase",
//       to: email,
//       subject: "Your OTP for RentEase",
//       text: `Your OTP is: ${otp}`
//     });

//     res.status(200).json({ message: "OTP sent" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Email failed" });
//   }
// });

// // ----------------------
// // Send Confirmation Mail
// // ----------------------
// async function sendConfirmationEmail(email, productName, totalPrice, duration) {
//   await transporter.sendMail({
//     from: "RentEase",
//     to: email,
//     subject: "🎉 Rent Confirmation",
//     html: `
//       <h2>Rent Confirmed ✅</h2>
//       <p><b>Product:</b> ${productName}</p>
//       <p><b>Duration:</b> ${duration} months</p>
//       <p><b>Total Price:</b> ₹${totalPrice}</p>
//     `
//   });
// }

// // ----------------------
// // Rent API
// // ----------------------
// app.post("/api/rent", async (req, res) => {
//   try {
//     const { productId, duration, email, otp } = req.body;

//     // OTP verify
//     if (!otpStore[email] || otpStore[email] !== otp) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     delete otpStore[email];

//     let product = null;

//     // Try find in DB
//     if (mongoose.Types.ObjectId.isValid(productId)) {
//       product = await Product.findById(productId);
//     }

//     // fallback (for frontend products)
//     if (!product) {
//       product = {
//         name: productId,
//         price: 1000
//       };
//     }

//     const totalPrice = product.price * duration;

//     // ✅ SAVE RENT
//     await Rent.create({
//       productName: product.name,
//       email,
//       duration,
//       totalPrice
//     });

//     // ✅ SEND EMAIL
//     await sendConfirmationEmail(email, product.name, totalPrice, duration);

//     res.status(200).json({
//       message: "Rent successful & email sent",
//       totalPrice
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ----------------------
// // Get Products
// // ----------------------
// app.get("/api/products", async (req, res) => {
//   const data = await Product.find();
//   res.json(data);
// });

// // ----------------------
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });



























