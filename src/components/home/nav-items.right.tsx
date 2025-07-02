import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NavItemsRight = ({ user }: { user: any }) => {
  const homeT = useTranslations("home.navigtion");
  return (
    <>
      {user ? (
        <Link
          href={"/dashboard"}
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          <Button variant={"outline"}> {homeT("name")}</Button>
        </Link>
      ) : (
        <Link
          href={"/login"}
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          <Button variant={"outline"}> {homeT("login")}</Button>
        </Link>
      )}
    </>
  );
};

export default NavItemsRight;
