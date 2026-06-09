import bcrypt from "bcryptjs";
import User from "../modules/UserSchema";

export const ensureSuperAdmin = async () => {
  const username = process.env.SUPER_ADMIN_USERNAME?.trim();
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!username || !email || !password) {
    console.warn(
      "Super admin bootstrap skipped: SUPER_ADMIN_USERNAME, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required.",
    );
    return;
  }

  if (password.length < 12) {
    throw new Error("SUPER_ADMIN_PASSWORD must be at least 12 characters");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    existingUser.username = username;
    existingUser.email = email;
    existingUser.password = passwordHash;
    existingUser.role = "superadmin";
    await existingUser.save();
    console.log(`Super admin synchronized: ${email}`);
    return;
  }

  await User.create({
    username,
    email,
    password: passwordHash,
    role: "superadmin",
  });
  console.log(`Super admin created: ${email}`);
};
