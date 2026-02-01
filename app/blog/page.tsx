import Navbar from "@/components/Navbar";
import BlogList from "@/components/BlogList";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <div className="w-full px-6 py-12 mx-auto max-w-[1200px] pt-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 dark:text-gray-100">Blog</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover insights, tutorials, and thoughts on technology and development.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 md:justify-center">
          <div className="md:flex-[7] w-full max-w-[900px]">
            <BlogList />
          </div>
          <Sidebar />
        </div>
      </div>
      <Footer />
    </>
  );
}