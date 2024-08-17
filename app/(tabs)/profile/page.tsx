import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";

async function getUser() {
  const session = await getSession();
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
    });
    if (user) {
      return user;
    }
  }
  notFound();
}

export default async function Profile() {
  const user = await getUser();

  const logout = async () => {
    "use server";
    const session = await getSession();
    session.destroy();
    redirect("/");
  };

  return (
    <div>
      <h1>Welcome! {user?.username} !</h1>
      {/* onClick으로 하면 client component로 작성해야하므로 Server Action 사용 따라서 form 작성 */}
      <form action={logout}>
        <button>Logout</button>
      </form>
    </div>
  );
}
