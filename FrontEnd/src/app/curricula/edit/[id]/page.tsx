"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/app/layout/Layout";
import EditCurriculumModal from "../../EditCurriculumModal";
import toast from "react-hot-toast";
import { showToast } from "@/components/toast";

export default function EditCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const curriculumId = params.id as string;
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    router.push("/curricula");
  };

  const handleSuccess = () => {
    showToast.success("Curriculum updated successfully!");
    router.push("/curricula");
  };

  return (
    <Layout allowedRoles={["admin", "teacher"]}>
      <EditCurriculumModal
        isOpen={isModalOpen}
        onClose={handleClose}
        curriculumId={curriculumId}
        onSuccess={handleSuccess}
      />
    </Layout>
  );
}
