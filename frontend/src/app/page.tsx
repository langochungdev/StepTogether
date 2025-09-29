import { redirect } from "next/navigation";

export default function HomePage() {
  // Khi vào root "/", tự động chuyển qua dashboard
  redirect("/dashboard");
}
