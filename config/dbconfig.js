const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`........MongoDB connected: ${conn.connection.host}.......`);
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = connectDb;
