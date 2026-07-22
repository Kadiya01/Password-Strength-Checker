import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/utils/validators";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { UserProfile } from "@/types/user.types";

interface ProfileFormProps {
  user: UserProfile;
  onSubmit: (data: ProfileFormData) => void;
  isPending: boolean;
}

export default function ProfileForm({ user, onSubmit, isPending }: ProfileFormProps) {
  const defaultFullName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "";

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: defaultFullName,
      email: user.email,
      username: user.username,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      <Input
        label="Full Name"
        placeholder="First and last name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <Input
        label="Email Address"
        type="email"
        placeholder="email@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Username"
        placeholder="username"
        error={errors.username?.message}
        {...register("username")}
      />
      <Button type="submit" isLoading={isPending} disabled={!isDirty} className="w-full h-11 rounded-xl">
        Save Profile Updates
      </Button>
    </form>
  );
}
