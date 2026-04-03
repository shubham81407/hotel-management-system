const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/HotelProject";

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hotelName: { type: String },
  role: { type: String, default: 'hoteladmin' } // 'hoteladmin' or 'superadmin'
});
const Admin = mongoose.model("Admin", AdminSchema);

const HotelSchema = new mongoose.Schema({
  name: String,
  location: String,
  address: String,
  description: String,
  imageUrl: String,
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
});
const Hotel = mongoose.model('Hotel', HotelSchema);

const RoomSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  title: String,
  description: String,
  pricePerNight: Number,
  capacity: Number,
  totalRooms: { type: Number, default: 1 },
  amenities: { type: String, default: "" },
  imageUrl: String,
  isAvailable: { type: Boolean, default: true }
});
const Room = mongoose.model('Room', RoomSchema);

const hotelsData = [
  {
    name: "Taj Mahal Palace",
    location: "Mumbai, India",
    address: "Apollo Bunder, Colaba, Mumbai, Maharashtra 400001",
    description: "An iconic symbol of Indian heritage, offering world-class luxury and breathtaking views of the Arabian Sea.",
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
    rating: 4.8,
    reviewCount: 15420
  },
  {
    name: "The Plaza Hotel",
    location: "New York, USA",
    address: "5th Avenue at Central Park South, New York, NY 10019",
    description: "Experience the timeless elegance and legendary service of New York's most famous hotel.",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    rating: 4.6,
    reviewCount: 9840
  },
  {
    name: "Burj Al Arab",
    location: "Dubai, UAE",
    address: "Jumeirah St, Umm Suqeim 3, Dubai",
    description: "The world's most luxurious hotel, shaped like the sail of a ship, offering extravagant suites and underwater dining.",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    rating: 4.9,
    reviewCount: 22100
  },
  {
    name: "The Ritz London",
    location: "London, UK",
    address: "150 Piccadilly, St. James's, London W1J 9BR",
    description: "A symbol of high society and luxury in the heart of London since 1906.",
    imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c0d129df?w=800",
    rating: 4.5,
    reviewCount: 8300
  },
  {
    name: "Marina Bay Sands",
    location: "Singapore",
    address: "10 Bayfront Ave, Singapore 018956",
    description: "An integrated resort notable for its stunning Infinity Pool and futuristic architecture.",
    imageUrl: "https://images.unsplash.com/photo-1585144860106-998ca0829315?w=800",
    rating: 4.7,
    reviewCount: 31050
  },
  {
    name: "Le Meurice",
    location: "Paris, France",
    address: "228 Rue de Rivoli, 75001 Paris",
    description: "The original palace hotel in the heart of historic Paris, blending 18th-century splendor with modern chic.",
    imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d14b8ba2?w=800",
    rating: 4.3,
    reviewCount: 4120
  }
];

const roomsData = [
  // Taj
  { title: "Gateway Suite", pricePerNight: 40000, capacity: 2, totalRooms: 5, amenities: "AC, WiFi, Ocean View, Breakfast, Room Service", imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800" },
  { title: "Palace Club Room", pricePerNight: 80000, capacity: 4, totalRooms: 2, amenities: "AC, WiFi, Butler Service, City View", imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800" },
  
  // NYC Plaza
  { title: "Central Park King", pricePerNight: 65000, capacity: 2, totalRooms: 10, amenities: "AC, WiFi, Park View, Bathtub", imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800" },
  { title: "Royal Plaza Suite", pricePerNight: 200000, capacity: 6, totalRooms: 1, amenities: "AC, WiFi, Grand Piano, Private Elevator", imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7def511?w=800" },
  
  // Burj 
  { title: "Deluxe One-Bedroom Suite", pricePerNight: 150000, capacity: 2, totalRooms: 15, amenities: "AC, WiFi, Spa, Panoramic Ocean View, Hermes Amenities", imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800" },
  
  // Ritz
  { title: "Standard Piccadilly Room", pricePerNight: 50000, capacity: 2, totalRooms: 8, amenities: "WiFi, Antique Furnishings", imageUrl: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=800" },
  
  // Marina
  { title: "Infinity Pool Studio", pricePerNight: 35000, capacity: 3, totalRooms: 20, amenities: "AC, WiFi, Pool Access, Balcony", imageUrl: "https://images.unsplash.com/photo-1522771731470-a31df7065963?w=800" },
  
  // Paris
  { title: "Classic Louvre Room", pricePerNight: 45000, capacity: 2, totalRooms: 3, amenities: "AC, WiFi, Breakfast, City View", imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800" }
];

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    console.log("Seeding Hotels & Rooms...");

    for (let i = 0; i < hotelsData.length; i++) {
        const hotelInfo = hotelsData[i];
        
        // Check if hotel exists
        const existingHotel = await Hotel.findOne({ name: hotelInfo.name });
        let hId = null;
        if (!existingHotel) {
            const h = new Hotel(hotelInfo);
            await h.save();
            hId = h._id;
            console.log(`Created Hotel: ${h.name}`);
        } else {
            // Update fields including rating
            Object.assign(existingHotel, hotelInfo);
            await existingHotel.save();
            hId = existingHotel._id;
            console.log(`Updated Hotel: ${existingHotel.name}`);
        }

        // Add rooms if none exist for this hotel
        const existingRooms = await Room.find({ hotelId: hId });
        if (existingRooms.length === 0) {
            if (i === 0) {
                await Room.create({ ...roomsData[0], hotelId: hId });
                await Room.create({ ...roomsData[1], hotelId: hId });
            } else if (i === 1) {
                await Room.create({ ...roomsData[2], hotelId: hId });
                await Room.create({ ...roomsData[3], hotelId: hId });
            } else if (i === 2) {
                await Room.create({ ...roomsData[4], hotelId: hId });
            } else if (i === 3) {
                await Room.create({ ...roomsData[5], hotelId: hId });
            } else if (i === 4) {
                await Room.create({ ...roomsData[6], hotelId: hId });
            } else if (i === 5) {
                await Room.create({ ...roomsData[7], hotelId: hId });
            }
        }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error", error);
    process.exit(1);
  }
}

seedDB();