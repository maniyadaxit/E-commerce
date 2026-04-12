import { useEffect, useState } from "react";
import { getAdminUsers, setAdminUserStatus } from "../api/adminApi";
import { Button } from "../components/ui/Button";

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  const refresh = async () => setUsers(await getAdminUsers());

  useEffect(() => {
    refresh().catch(() => setUsers([]));
  }, []);

  return (
    <section className="section-shell py-10">
      <h1 className="font-display text-5xl text-ink">Users</h1>
      <div className="mt-8 space-y-4">
        {users.map((user) => (
          <div key={user.id} className="rounded-[2rem] bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">{user.name}</p>
                <p className="text-sm text-copy/60">{user.email}</p>
              </div>
              <Button
                variant={user.enabled ? "secondary" : "accent"}
                onClick={() => setAdminUserStatus(user.id, !user.enabled).then(refresh)}
              >
                {user.enabled ? "Ban" : "Unban"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
