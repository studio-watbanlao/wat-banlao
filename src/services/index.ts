import axiosInstance from "./axios";

export const fetchPost = async (id: number): Promise<any> => {
  const response = await axiosInstance.get<any>(`/posts/${id}`);
  return response.data;
};
