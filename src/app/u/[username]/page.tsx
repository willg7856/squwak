import { redirect } from "next/navigation";

export default function DeprecatedProfilePage() {
  redirect("/settings");
}
