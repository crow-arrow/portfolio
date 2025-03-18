export default function handler(req, res) {
  res
    .status(200)
    .json({ message: `${process.env.EMAIL_USER} API is working!` });
}
