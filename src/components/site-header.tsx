"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setIsAuthed(Boolean(data.user));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session?.user));
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="flex flex-col gap-5 border-b border-[#E9EEE8] px-6 py-5 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14">
      <Link className="flex items-center gap-3" href="/">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DDE5DC] bg-[#E8F1E7] text-[#123D24]">
          <BookOpen size={24} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#123D24]">雅思写作提分教练</p>
          <p className="text-xs text-[#8A938B]">IELTS Writing Growth Coach</p>
        </div>
      </Link>

      <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#102014] sm:gap-5">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href.startsWith("/report") && pathname.startsWith("/report"));

          return (
            <Link
              className={cn(
                "rounded-full px-4 py-2 transition hover:bg-[#E8F1E7]",
                active && "bg-[#E8F1E7] text-[#123D24]",
              )}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        {isAuthed ? (
          <>
            <Link href="/settings">
              <Button size="sm" variant="ghost">
                设置
              </Button>
            </Link>
            <form action="/auth/logout" method="post">
              <Button size="sm" type="submit" variant="ghost">
                退出
              </Button>
            </form>
          </>
        ) : (
          <Link href="/auth/login">
            <Button size="sm" variant="ghost">
              登录
            </Button>
          </Link>
        )}
        <Link href="/write">
          <Button size="sm">
            <GraduationCap size={16} />
            开始练习
          </Button>
        </Link>
      </div>
    </header>
  );
}
