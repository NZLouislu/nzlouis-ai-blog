import { create } from "zustand";

interface TableData {
  table: string;
  count?: number;
  data?: Record<string, unknown>[];
  structure?: Record<string, unknown>[];
}

interface SupabaseState {
  tableData: Record<string, TableData>;
  selectedTable: string;
  isLoading: boolean;
  error: string | null;

  setTableData: (table: string, data: Partial<TableData>) => void;
  setSelectedTable: (table: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchTableCount: (table: string) => Promise<void>;
  fetchTableData: (table: string) => Promise<void>;
  fetchAllTableCounts: () => Promise<void>;
}

export const useSupabaseStore = create<SupabaseState>((set, get) => ({
  tableData: {},
  selectedTable: "",
  isLoading: false,
  error: null,

  setTableData: (table, data) =>
    set((state) => ({
      tableData: {
        ...state.tableData,
        [table]: { ...state.tableData[table], ...data, table },
      },
    })),

  setSelectedTable: (table) => set({ selectedTable: table }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  fetchTableCount: async (table: string) => {
    const { setTableData, setError } = get();
    try {
      const response = await fetch(
        `/api/admin/supabase?table=${table}&action=count`
      );
      if (response.ok) {
        const data = await response.json();
        setTableData(table, data);
      } else {
        throw new Error(`Failed to fetch count for ${table}`);
      }
    } catch (error) {
      console.error(`Error fetching count for ${table}:`, error);
      setError(`Failed to fetch count for ${table}`);
    }
  },

  fetchTableData: async (table: string) => {
    const { setTableData, setLoading, setError } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/admin/supabase?table=${table}&action=all`
      );
      if (response.ok) {
        const data = await response.json();
        setTableData(table, data);
      } else {
        throw new Error(`Failed to fetch data for ${table}`);
      }
    } catch (error) {
      console.error(`Error fetching data for ${table}:`, error);
      setError(`Failed to fetch data for ${table}`);
    } finally {
      setLoading(false);
    }
  },

  fetchAllTableCounts: async () => {
    const { fetchTableCount } = get();
    const tables = ["comments", "post_stats", "daily_stats", "feature_toggles"];

    try {
      await Promise.all(tables.map((table) => fetchTableCount(table)));
    } catch (error) {
      console.error("Error fetching table counts:", error);
    }
  },
}));
