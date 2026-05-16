import { Appointment } from "@/types/domain";

type AppointmentsTableProps = {
  appointments: Appointment[];
};

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  return (
    <section className="rounded-3xl border border-[#d8bf81] bg-white p-6 shadow-sm">
      <h2 className="font-serif text-3xl text-[#1b1b1b]">Appointments</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#efe4c9] text-[#7a6635]">
              <th className="py-3 pr-4 font-semibold">Customer</th>
              <th className="py-3 pr-4 font-semibold">Date</th>
              <th className="py-3 pr-4 font-semibold">Duration</th>
              <th className="py-3 pr-4 font-semibold">Stylist</th>
              <th className="py-3 pr-4 font-semibold">Room</th>
              <th className="py-3 pr-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-b border-[#f3ecd9] text-[#272727]">
                <td className="py-3 pr-4">{appointment.customerName}</td>
                <td className="py-3 pr-4">{new Date(appointment.appointmentAt).toLocaleString("en-US")}</td>
                <td className="py-3 pr-4">{appointment.durationMinutes} mins</td>
                <td className="py-3 pr-4">{appointment.stylistName ?? "-"}</td>
                <td className="py-3 pr-4">{appointment.fittingRoom ?? "-"}</td>
                <td className="py-3 pr-4 capitalize">{appointment.status.replaceAll("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
