import Admin from "../models/Admin.js";
import Customer from "../models/Customer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    const existingCustomer = await Customer.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });

    if (existingCustomer || existingAdmin) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    res.status(201).json({
      message: "Customer registered successfully",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
async function registerAdmin(req, res) {
  try {
    const { name, email, password } = req.body;
    const existingCustomer = await Customer.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });

    if (existingCustomer || existingAdmin) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Admin  registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
async function login(req, res) {
  try {
    const { email, password } = req.body;
    let user = await Admin.findOne({ email });
    let role = "admin";
    if (!user) {
      user = await Customer.findOne({ email });
      role = "customer";
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password",
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
        role: role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export { register, login, registerAdmin
 };
