// 📁 src/app/actions/auth.ts
"use server";

import { createServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ensureUserExists } from "@/lib/queries";

interface AuthResponse {
    error: null | string;
    success: boolean;
    data: unknown | null;
}

export const signUpAction = async (formData: FormData): Promise<AuthResponse> => {
    const supabase = await createServer();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    const { data: signupData, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { fullName } },
    });

    if (!error && signupData.user) {
        await ensureUserExists({ id: signupData.user.id, email });
    }

    return {
        error: error?.message || (signupData.user ? null : "注册过程中出现错误！"),
        success: !error,
        data: signupData || null,
    };
};

export const signInAction = async (formData: FormData): Promise<AuthResponse> => {
    const supabase = await createServer();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data: signinData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && signinData.user) {
        await ensureUserExists({ id: signinData.user.id, email });
    }

    return {
        error: error?.message || "登录时出现错误！",
        success: !error,
        data: signinData || null,
    };
};

export const logoutAction = async (): Promise<void> => {
    const supabase = await createServer();
    await supabase.auth.signOut();
    redirect("/login");
};

export const updateProfileAction = async ({ fullName }: { fullName: string }): Promise<AuthResponse> => {
    const supabase = await createServer();

    const { data: profileData, error } = await supabase.auth.updateUser({
        data: { fullName },
    });

    return {
        error: error?.message || "更新个人资料时出现错误",
        success: !error,
        data: profileData || null,
    };
};

export const resetPasswordAction = async ({ email }: { email: string }): Promise<AuthResponse> => {
    const supabase = await createServer();

    const { data, error } = await supabase.auth.resetPasswordForEmail(email);

    return {
        error: error?.message || "发送重置密码邮件时出现错误！",
        success: !error,
        data: data || null,
    };
};

export const changePasswordAction = async (newPassword: string): Promise<AuthResponse> => {
    const supabase = await createServer();
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    return {
        error: error?.message || "修改密码时出现错误！",
        success: !error,
        data: data || null,
    };
};

const signInWith = (provider: "google" | "github") => async () => {
    const supabase = await createServer();
    const auth_callback_url = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: auth_callback_url,
        },
    });

    if (error) {
        console.error(error);
    }
    if (data?.url) redirect(data.url);
};

export const signinWithGoogle = signInWith("google");
export const signinWithGithub = signInWith("github");
