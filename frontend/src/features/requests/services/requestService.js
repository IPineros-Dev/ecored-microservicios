import httpClient from "../../../shared/services/httpClient.js";

const REQUESTS_ENDPOINT = "/requests";

export async function listRequests({ signal } = {}) {
    const response = await httpClient.get(REQUESTS_ENDPOINT, { signal });
    return response.data;
}

export async function createRequest(payload) {
    const response = await httpClient.post(REQUESTS_ENDPOINT, payload);
    return response.data;
}

export async function updateRequestStatus(id, status) {
    const response = await httpClient.patch(`${REQUESTS_ENDPOINT}/${id}/status`, { status });
    return response.data;
}

export async function deleteRequest(id) {
    await httpClient.delete(`${REQUESTS_ENDPOINT}/${id}`);
}