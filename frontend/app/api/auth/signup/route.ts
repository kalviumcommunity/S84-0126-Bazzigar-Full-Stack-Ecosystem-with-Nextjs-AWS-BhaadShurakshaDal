import { signupSchema } from "@/lib/schemas/auth.schema";

export async function handleSignupSubmit(formData: {
  name: string;
  email: string;
  password: string;
}) {
  const result = signupSchema.safeParse(formData);

  if (!result.success) {
    console.log(result.error.issues);
    return;
  }

  await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
}
