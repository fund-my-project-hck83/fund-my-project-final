"use client";

import { useState, useEffect } from "react";
import { Video, Calendar, Clock, X } from "lucide-react";
import { ILivestream } from "@/interfaces/interfaces";

interface ScheduleLivestreamProps {
  isOpen: boolean;
  onClose: () => void;
  projectSlug: string;
  onScheduleSuccess?: () => void;
  editMode?: boolean;
  existingLivestream?: ILivestream | null;
}

interface LivestreamForm {
  title: string;
  description: string;
  scheduledAt: string;
}

export default function ScheduleLivestream({
  isOpen,
  onClose,
  projectSlug,
  onScheduleSuccess,
  editMode = false,
  existingLivestream = null,
}: ScheduleLivestreamProps) {
  const [form, setForm] = useState<LivestreamForm>({
    title: "",
    description: "",
    scheduledAt: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (editMode && existingLivestream) {
      const scheduledDate = new Date(existingLivestream.scheduledAt);
      const formattedDate = scheduledDate.toISOString().slice(0, 16); // Format for datetime-local input
      
      setForm({
        title: existingLivestream.title,
        description: existingLivestream.description || "",
        scheduledAt: formattedDate,
      });
    } else if (!editMode) {
      // Reset form for new streams
      setForm({
        title: "",
        description: "",
        scheduledAt: "",
      });
    }
  }, [editMode, existingLivestream, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.scheduledAt) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate scheduled date is in the future
    const scheduledDate = new Date(form.scheduledAt);
    if (scheduledDate <= new Date()) {
      setError("Scheduled date must be in the future");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const url = `/api/livestreams/project/${projectSlug}`;
      const method = editMode ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          scheduledAt: scheduledDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || `Failed to ${editMode ? 'update' : 'schedule'} livestream`);
      }

      await response.json();

      // Reset form only if creating new stream
      if (!editMode) {
        setForm({
          title: "",
          description: "",
          scheduledAt: "",
        });
      }

      // Call success callback
      if (onScheduleSuccess) {
        onScheduleSuccess();
      }

      // Close modal
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to ${editMode ? 'update' : 'schedule'} livestream`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      if (!editMode) {
        setForm({
          title: "",
          description: "",
          scheduledAt: "",
        });
      }
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-black rounded-lg p-6 max-w-md mx-4 w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-black flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            {editMode ? "Edit Livestream" : "Schedule Livestream"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-black transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm font-normal">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 border border-blue-300 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-gray-600 text-sm font-normal">
              {editMode 
                ? "Update your livestream details"
                : "Schedule a livestream to engage with your supporters"
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Stream Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-gray-50 font-normal"
              placeholder="Enter stream title"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-gray-50 resize-none font-normal"
              placeholder="Describe what you'll be streaming about"
              rows={3}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Scheduled Date & Time *
            </label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  scheduledAt: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-gray-50 font-normal"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1 font-normal">
              Choose a future date and time for your livestream
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-full font-normal hover:border-black hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-black text-white py-2 px-4 rounded-full font-normal hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {editMode ? "Updating..." : "Scheduling..."}
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  {editMode ? "Update Stream" : "Schedule Stream"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
