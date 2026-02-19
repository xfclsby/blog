import axios from 'axios';
import { REPO_OWNER, REPO_NAME, DATA_BRANCH } from '../config';

const GITHUB_API_URL = 'https://api.github.com';

const getToken = () => localStorage.getItem('github_token');

const api = axios.create({
  baseURL: GITHUB_API_URL,
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `token ${token}`;
  }
  return config;
});

// Helper to handle base64 decoding properly for UTF-8
const decodeBase64 = (str) => {
    return decodeURIComponent(escape(window.atob(str.replace(/\s/g, ''))));
};

// Helper to encode string to base64 for UTF-8
const encodeBase64 = (str) => {
    return window.btoa(unescape(encodeURIComponent(str)));
};


export const getUser = async () => {
  try {
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getFiles = async (path) => {
  try {
    const response = await api.get(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
      params: { ref: DATA_BRANCH }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
};

export const getFileContent = async (path) => {
  try {
    const response = await api.get(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
      params: { ref: DATA_BRANCH }
    });
    const content = decodeBase64(response.data.content);
    return { ...response.data, content };
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw error;
  }
};

export const createOrUpdateFile = async (path, content, message, sha = null) => {
  try {
    const contentBase64 = encodeBase64(content);
    const data = {
      message,
      content: contentBase64,
      branch: DATA_BRANCH,
    };
    if (sha) {
      data.sha = sha;
    }
    const response = await api.put(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating/updating file:', error);
    throw error;
  }
};

export const createFile = async (path, content, message) => {
    return createOrUpdateFile(path, content, message);
};

export const updateFile = async (path, content, sha, message) => {
    return createOrUpdateFile(path, content, message, sha);
};

export const deleteFile = async (path, sha, message) => {
  try {

    const data = {
      message,
      sha,
      branch: DATA_BRANCH,
    };
    const response = await api.delete(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, { data });
    return response.data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const uploadImage = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Content = reader.result.split(',')[1];
            const fileName = `${Date.now()}_${file.name}`;
            const path = `public/uploads/${fileName}`;
            try {
                const response = await api.put(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
                    message: `Upload image ${fileName}`,
                    content: base64Content,
                    branch: DATA_BRANCH
                });
                // Construct the download URL manually or use the one from response
                // If using GitHub Pages, the URL might be different from raw.githubusercontent.com
                // But for now let's use the download_url from API response which points to raw content
                resolve(response.data.content.download_url);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = error => reject(error);
    });
};

export const uploadMusic = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Content = reader.result.split(',')[1];
            const fileName = file.name;
            const path = `public/music/${fileName}`;
             try {
                const response = await api.put(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
                    message: `Upload music ${fileName}`,
                    content: base64Content,
                    branch: DATA_BRANCH
                });
                resolve(response.data.content.download_url);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = error => reject(error);
    });
};
