import React, { useState } from "react";
import EXIF from "exif-js";
import { toast } from "react-hot-toast";
import Button from "../../../components/atoms/Button/Button";
import Input from "../../../components/atoms/Input/Input";
import { useCreateReportMutation } from "../../../store/api/reportApi";

const categories = ["road","electricity","water","sanitation","safety","emergency","illegal_activity"];
const priorities = ["low","medium","high","urgent"];
const severities = ["low","medium","high","emergency"];

const CreateReportForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
    ward: "",
    lat: "",
    lng: "",
    priority: "medium",
    severity: "medium",
    dueDate: "",
    photos: [],
    videos: [],
  });

  const [errors, setErrors] = useState({});
  const [createReport, { isLoading }] = useCreateReportMutation();

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const filesArray = Array.from(files);
      setFormData((prev) => ({ ...prev, [name]: filesArray }));

      // If photos, try extract location from first photo
      if (name === "photos" && filesArray.length > 0) {
        const firstPhoto = filesArray[0];
        EXIF.getData(firstPhoto, function() {
          const lat = EXIF.getTag(this, "GPSLatitude");
          const lon = EXIF.getTag(this, "GPSLongitude");
          const latRef = EXIF.getTag(this, "GPSLatitudeRef");
          const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

          if (lat && lon && latRef && lonRef) {
            const toDecimal = (gps, ref) => {
              const [deg, min, sec] = gps;
              let dec = deg + min / 60 + sec / 3600;
              if (ref === "S" || ref === "W") dec = -dec;
              return dec;
            };

            const latitude = toDecimal(lat, latRef);
            const longitude = toDecimal(lon, lonRef);

            setFormData((prev) => ({
              ...prev,
              lat: latitude.toFixed(6),
              lng: longitude.toFixed(6),
            }));

            toast.success("Location extracted from photo!");
          }
        });
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Select a category";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.ward.trim()) newErrors.ward = "Ward is required";
    if (!formData.lat || !formData.lng) newErrors.location = "Latitude and Longitude are required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("category", formData.category);
    payload.append("location[address]", formData.address);
    payload.append("location[ward]", formData.ward);
    payload.append("location[coordinates][lat]", formData.lat);
    payload.append("location[coordinates][lng]", formData.lng);
    payload.append("priority", formData.priority);
    payload.append("severity", formData.severity);
    if (formData.dueDate) payload.append("dueDate", formData.dueDate);

    formData.photos.forEach((file) => payload.append("photos", file));
    formData.videos.forEach((file) => payload.append("videos", file));

    try {
      await createReport(payload).unwrap();
      toast.success("Report created successfully!");
      setFormData({
        title: "",
        description: "",
        category: "",
        address: "",
        ward: "",
        lat: "",
        lng: "",
        priority: "medium",
        severity: "medium",
        dueDate: "",
        photos: [],
        videos: [],
      });
    } catch (error) {
      toast.error(error.data?.message || "Failed to create report");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Create New Report</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter report title"
          error={errors.title}
          required
        />

        <div>
          <label className="block text-gray-700 font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the issue"
            className={`w-full border p-2 rounded ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            rows={4}
            required
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full border p-2 rounded ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border p-2 rounded border-gray-300"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Severity</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full border p-2 rounded border-gray-300"
            >
              {severities.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full border p-2 rounded border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              error={errors.address}
              required
            />
          </div>
          <div>
            <Input
              label="Ward"
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              placeholder="Enter ward"
              error={errors.ward}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Latitude"
              name="lat"
              value={formData.lat}
              onChange={handleChange}
              placeholder={formData.lat}
            />
            <Input
              label="Longitude"
              name="lng"
              value={formData.lng}
              onChange={handleChange}
              placeholder={formData.lng}
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Photos</label>
          <input
            type="file"
            name="photos"
            onChange={handleChange}
            multiple
            accept="image/*"
            className="w-full border p-2 rounded border-gray-300"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Videos</label>
          <input
            type="file"
            name="videos"
            onChange={handleChange}
            multiple
            accept="video/*"
            className="w-full border p-2 rounded border-gray-300"
          />
        </div>

        <Button type="submit" variant="primary" fullWidth loading={isLoading}>
          {isLoading ? "Creating..." : "Create Report"}
        </Button>
      </form>
    </div>
  );
};

export default CreateReportForm;
