"use client";
import { useCallback, useEffect, useState } from "react";
import { adminUsersApi } from "@/lib/api/admin/users";
import { DataTable, Column } from "@/components/ui/data-table";
import { ApiError } from "@/lib/api/errors";
import type { User, UserRole } from "@/lib/api/types";

const ROLES: UserRole[] = ["CUSTOMER", "STAFF", "ADMIN"];

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await adminUsersApi.list({ page: p, limit: 20 });
      setUsers(result.data);
      setTotalPages(result.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(page); }, [load, page]);

  async function handleRoleChange(user: User, role: UserRole) {
    try {
      await adminUsersApi.updateRole(user.id, role);
      void load(page);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Update failed.");
    }
  }

  async function handleStatusToggle(user: User) {
    try {
      await adminUsersApi.updateStatus(user.id, !user.isActive);
      void load(page);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Update failed.");
    }
  }

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      render: (u) => `${u.firstName} ${u.lastName}`,
    },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <select
          value={u.role}
          onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
          className="border border-line bg-transparent px-2 py-1 text-[12px] focus:outline-none"
        >
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (u) => (
        <button
          onClick={() => handleStatusToggle(u)}
          className={`text-[12px] underline-offset-2 hover:underline ${u.isActive ? "text-green-600" : "text-red-500"}`}
        >
          {u.isActive ? "Active" : "Suspended"}
        </button>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (u) => new Date(u.createdAt).toLocaleDateString("en-IN"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[11px] uppercase tracking-[0.28em]">Users</h1>
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found."
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
