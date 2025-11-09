// pages/gov-dashboard.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Contractor {
  company_bn: string;
  company_name: string;
  email: string;
  verification_status: boolean;
}

interface Report {
  report_id: string;
  category: string;
  description: string;
  serverity: string;
  contractor_assigned: string | null;
}

export default function GovDashboard() {
  const router = useRouter();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingContractors, setLoadingContractors] = useState<boolean>(false);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("gov_token") : null;

  useEffect(() => {
    if (!token) router.push("/gov-login");
    else {
      fetchContractors();
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchContractors = async (): Promise<void> => {
    setLoadingContractors(true);
    try {
      const res = await fetch("http://localhost:9000/api/contractors");
      const data: Contractor[] = await res.json();
      setContractors(data);
    } catch (e) {
      alert("Failed loading contractors");
    }
    setLoadingContractors(false);
  };

  const fetchReports = async (): Promise<void> => {
    setLoadingReports(true);
    try {
      const res = await fetch("http://localhost:9000/api/reports");
      const data: Report[] = await res.json();
      setReports(data);
    } catch (e) {
      alert("Failed loading reports");
    }
    setLoadingReports(false);
  };

  const verifyContractor = async (
    company_bn: string,
    status: boolean
  ): Promise<void> => {
    try {
      const res = await fetch(
        `http://localhost:9000/api/contractors/${company_bn}/verify`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verification_status: status,
          }),
        }
      );

      if (!res.ok) return alert("Failed updating");

      // update local
      setContractors((prev) =>
        prev.map((c) =>
          c.company_bn === company_bn
            ? { ...c, verification_status: status }
            : c
        )
      );
    } catch (e) {
      alert("Error updating");
    }
  };

  const assignContractor = async (
    report_id: string,
    company_bn: string
  ): Promise<void> => {
    try {
      const res = await fetch(
        `http://localhost:9000/api/reports/${report_id}/assign`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractor_assigned: company_bn,
          }),
        }
      );

      if (!res.ok) return alert("Failed assigning contractor");

      setReports((prev) =>
        prev.map((r) =>
          r.report_id === report_id
            ? { ...r, contractor_assigned: company_bn }
            : r
        )
      );
    } catch (e) {
      alert("Error assigning");
    }
  };

  const logout = (): void => {
    localStorage.removeItem("gov_token");
    router.push("/gov-login");
  };

  return (
    <div>
      <h1>Government Dashboard</h1>

      <button onClick={logout}>Logout</button>

      {/* CONTRACTORS */}
      <section>
        <h2>Contractors</h2>
        {loadingContractors ? (
          <p>Loading contractors...</p>
        ) : (
          <>
            {contractors.map((c) => (
              <div
                key={c.company_bn}
                style={{
                  border: "1px solid gray",
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <p>
                  <b>Company:</b> {c.company_name}
                </p>
                <p>
                  <b>BN:</b> {c.company_bn}
                </p>
                <p>
                  <b>Email:</b> {c.email}
                </p>
                <p>
                  <b>Verified:</b> {c.verification_status ? "✅ Yes" : "❌ No"}
                </p>

                <button onClick={() => verifyContractor(c.company_bn, true)}>
                  Verify
                </button>
                <button onClick={() => verifyContractor(c.company_bn, false)}>
                  Unverify
                </button>
              </div>
            ))}
          </>
        )}
      </section>

      {/* REPORTS */}
      <section>
        <h2>Reports</h2>

        {loadingReports ? (
          <p>Loading reports...</p>
        ) : (
          <>
            {reports.map((r) => (
              <div
                key={r.report_id}
                style={{
                  border: "1px solid gray",
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <p>
                  <b>ID:</b> {r.report_id}
                </p>
                <p>
                  <b>Category:</b> {r.category}
                </p>
                <p>
                  <b>Description:</b> {r.description}
                </p>
                <p>
                  <b>Severity:</b> {r.serverity}
                </p>
                <p>
                  <b>Assigned:</b> {r.contractor_assigned}
                </p>

                {/* Select contractor */}
                <select
                  defaultValue={r.contractor_assigned || ""}
                  onChange={(e) =>
                    assignContractor(r.report_id, e.target.value)
                  }
                >
                  <option value="">None</option>
                  {contractors
                    .filter((c) => c.verification_status)
                    .map((c) => (
                      <option key={c.company_bn} value={c.company_bn}>
                        {c.company_name}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  );
}
