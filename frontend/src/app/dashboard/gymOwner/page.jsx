import { redirect } from "next/navigation"
export default function page() {
redirect("/dashboard/gymOwner/profile");
return null;
}