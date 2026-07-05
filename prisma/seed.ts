import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { addDays, setHours, startOfWeek } from "date-fns";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.shift.deleteMany();
  await prisma.employee.deleteMany();

  const [anna, mikkel, sofie, jonas, lea] = await Promise.all(
    [
      { name: "Anna Jensen", email: "anna@esmiley.dk", role: Role.CHEF },
      { name: "Mikkel Sørensen", email: "mikkel@esmiley.dk", role: Role.WAITER },
      { name: "Sofie Nielsen", email: "sofie@esmiley.dk", role: Role.WAITER },
      { name: "Jonas Petersen", email: "jonas@esmiley.dk", role: Role.DISHWASHER },
      { name: "Lea Andersen", email: "lea@esmiley.dk", role: Role.CHEF },
    ].map((data) => prisma.employee.create({ data }))
  );

  // Build a demo week of shifts around the current week (Monday-based)
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const at = (day: number, hour: number) => setHours(addDays(monday, day), hour);

  const shifts = [
    // Monday
    { startsAt: at(0, 8), endsAt: at(0, 16), role: Role.CHEF, employeeId: anna.id },
    { startsAt: at(0, 10), endsAt: at(0, 18), role: Role.WAITER, employeeId: mikkel.id },
    { startsAt: at(0, 16), endsAt: at(0, 22), role: Role.DISHWASHER, employeeId: jonas.id },
    // Tuesday
    { startsAt: at(1, 8), endsAt: at(1, 16), role: Role.CHEF, employeeId: lea.id },
    { startsAt: at(1, 10), endsAt: at(1, 18), role: Role.WAITER, employeeId: sofie.id },
    // Wednesday
    { startsAt: at(2, 8), endsAt: at(2, 16), role: Role.CHEF, employeeId: anna.id },
    { startsAt: at(2, 16), endsAt: at(2, 22), role: Role.WAITER, employeeId: mikkel.id },
    // Thursday
    { startsAt: at(3, 8), endsAt: at(3, 16), role: Role.CHEF, employeeId: lea.id },
    { startsAt: at(3, 10), endsAt: at(3, 18), role: Role.WAITER, employeeId: sofie.id },
    { startsAt: at(3, 16), endsAt: at(3, 22), role: Role.DISHWASHER, employeeId: jonas.id },
    // Friday — one unassigned shift for the demo
    { startsAt: at(4, 8), endsAt: at(4, 16), role: Role.CHEF, employeeId: anna.id },
    { startsAt: at(4, 16), endsAt: at(4, 23), role: Role.WAITER, employeeId: null },
  ];

  await prisma.shift.createMany({ data: shifts });

  console.log(`Seeded ${shifts.length} shifts for 5 employees.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
