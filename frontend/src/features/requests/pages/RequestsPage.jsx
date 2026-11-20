import { useEffect, useState } from "react";
import {
    createRequest,
    deleteRequest,
    listRequests,
    updateRequestStatus,
} from "../services/requestService.js";

const STATUSES = ["PENDIENTE", "PROGRAMADA", "COMPLETADA", "CANCELADA"];

const INITIAL_FORM = {
    materialName: "",
    quantityKg: "",
    pickupAddress: "",
    scheduledDate: "",
    notes: "",
};
function getFriendlyError(err, fallback) {
    return err?.response?.data?.detail || err?.message || fallback;
}

export default function RequestsPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadRequests = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listRequests();
            setItems(Array.isArray(data?.items) ? data.items : []);
        } catch (err) {
            setError(getFriendlyError(err, "No se pudo consultar el servicio de solicitudes."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccess("");
        try {
            const created = await createRequest({
                ...form,
                quantityKg: Number(form.quantityKg),
            });
            setItems((prev) => [created, ...prev]);
            setForm(INITIAL_FORM);
            setSuccess("Solicitud de recolección registrada correctamente.");
        } catch (err) {
            setError(getFriendlyError(err, "Error al registrar la solicitud."));
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        setError("");
        try {
            const updated = await updateRequestStatus(id, status);
            setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
        } catch (err) {
            setError(getFriendlyError(err, "No se pudo actualizar el estado."));
        }
    };

    const handleDelete = async (id) => {
        setError("");
        try {
            await deleteRequest(id);
            setItems((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            setError(getFriendlyError(err, "No se pudo eliminar la solicitud."));
        }
    };

    return (
        <div className="d-flex flex-column gap-4">
            <div>
                <h1 className="h3 mb-1">Solicitudes de recolección</h1>
                <p className="text-muted mb-0">
                    Programa y gestiona retiros de materiales reciclables (microservicio autónomo en MongoDB).
                </p>
            </div>

            {error && <div className="alert alert-danger mb-0">{error}</div>}
            {success && <div className="alert alert-success mb-0">{success}</div>}

            <div className="card shadow-sm">
                <div className="card-body">
                    <h2 className="h5 mb-3">Nueva solicitud</h2>
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-5">
                            <label className="form-label">Material</label>
                            <input
                                type="text"
                                name="materialName"
                                className="form-control"
                                placeholder="Ej. Cartón corrugado"
                                value={form.materialName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Cantidad (kg)</label>
                            <input
                                type="number"
                                name="quantityKg"
                                step="0.1"
                                min="0.1"
                                className="form-control"
                                placeholder="25"
                                value={form.quantityKg}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Fecha programada</label>
                            <input
                                type="date"
                                name="scheduledDate"
                                className="form-control"
                                value={form.scheduledDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Dirección de recolección</label>
                            <input
                                type="text"
                                name="pickupAddress"
                                className="form-control"
                                placeholder="Calle 26 # 68-15, Bogotá"
                                value={form.pickupAddress}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Notas (opcional)</label>
                            <input
                                type="text"
                                name="notes"
                                className="form-control"
                                placeholder="Horario o punto de acceso"
                                value={form.notes}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-12">
                            <button type="submit" className="btn btn-success" disabled={submitting}>
                                {submitting ? "Guardando..." : "Registrar solicitud"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2 className="h5 mb-0">Solicitudes registradas</h2>
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={loadRequests}>
                            Recargar
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-muted mb-0">Cargando solicitudes...</p>
                    ) : items.length === 0 ? (
                        <p className="text-muted mb-0">Aún no hay solicitudes registradas.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Material</th>
                                        <th>Peso</th>
                                        <th>Dirección</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th className="text-end">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="fw-semibold">{item.materialName}</div>
                                                {item.notes && <div className="small text-muted">{item.notes}</div>}
                                            </td>
                                            <td>{item.quantityKg} kg</td>
                                            <td>{item.pickupAddress}</td>
                                            <td>{item.scheduledDate}</td>
                                            <td>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={item.status}
                                                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                >
                                                    {STATUSES.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}