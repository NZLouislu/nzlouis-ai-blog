"use client";

import { useEffect, useState } from "react";
import AuthCheck from "../auth-check";
import AdminNavbar from "../../../../components/AdminNavbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TableInfo {
  name: string;
  count: number | null;
  data: Record<string, unknown>[];
}

const tableNames = ["comments", "post_stats", "daily_stats", "feature_toggles", "users", "posts"];

export default function DatabaseDashboard() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<Record<string, TableInfo>>({});

  useEffect(() => {
    tableNames.forEach(async (name) => {
      try {
        const res = await fetch(`/api/admin/database?table=${name}&action=count`);
        if (res.ok) {
          const data = await res.json();
          setTables(prev => {
            const existing = prev.find(t => t.name === name);
            if (existing) {
              return prev.map(t => t.name === name ? { ...t, count: data.count } : t);
            }
            return [...prev, { name, count: data.count, data: [] }];
          });
        }
      } catch {
        setTables(prev => [...prev, { name, count: 0, data: [] }]);
      }
    });
  }, []);

  const handleTableSelect = async (tableName: string) => {
    setSelectedTable(tableName);
    if (tableData[tableName]?.data?.length > 0) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/database?table=${tableName}&action=all`);
      if (res.ok) {
        const data = await res.json();
        setTableData(prev => ({
          ...prev,
          [tableName]: { name: tableName, count: data.data?.length || 0, data: data.data || [] }
        }));
      }
    } catch {
      console.error("Failed to fetch table data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Database Dashboard
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  View and analyze database tables
                </p>
              </div>
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {tables.map((table) => (
                    <Card
                      key={table.name}
                      className={`cursor-pointer transition-colors ${
                        selectedTable === table.name
                          ? "ring-2 ring-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleTableSelect(table.name)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg capitalize">
                          {table.name.replace("_", " ")}
                        </CardTitle>
                        <CardDescription>
                          Records: {table.count ?? "Loading..."}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>

                {selectedTable && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Table: {selectedTable}</CardTitle>
                      <CardDescription>
                        {tableData[selectedTable]?.count || 0} records total
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="text-center py-4">Loading data...</div>
                      ) : tableData[selectedTable]?.data?.length ? (
                        <div className="overflow-auto max-h-96">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-100">
                                {Object.keys(
                                  tableData[selectedTable].data[0] || {}
                                ).map((key) => (
                                  <th
                                    key={key}
                                    className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                  >
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tableData[selectedTable].data.map(
                                (row, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    {Object.values(row).map(
                                      (value, cellIndex) => (
                                        <td
                                          key={cellIndex}
                                          className="border border-gray-300 px-4 py-2 text-sm"
                                        >
                                          {typeof value === "object" &&
                                          value !== null
                                            ? JSON.stringify(value)
                                            : String(value ?? "")}
                                        </td>
                                      )
                                    )}
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
