const STEP_IMGS = [
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b36369a43cace0e1e7f072/77d1aa5d4_generated_22e3178e.png",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b36369a43cace0e1e7f072/fb1054ed6_generated_9edb1e52.png",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b36369a43cace0e1e7f072/58dd76f72_generated_7a18544e.png",
];

const steps = [
  {
    num: "STEP 01",
    title: "Upload Prescription",
    desc: "Securely upload your doctor's prescription through our app. We accept photos and digital prescriptions.",
    img: STEP_IMGS[0],
    delay: "",
  },
  {
    num: "STEP 02",
    title: "Pharmacy Verifies",
    desc: "Your selected pharmacy reviews and confirms the order, ensuring accuracy and safety for every medicine.",
    img: STEP_IMGS[1],
    delay: "delay-1",
  },
  {
    num: "STEP 03",
    title: "Medicine Delivered",
    desc: "Your medicines are carefully prepared and delivered right to your doorstep — quickly and reliably.",
    img: STEP_IMGS[2],
    delay: "delay-2",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-[#f0faf8]">
      <div className="max-w-[1200px] mx-auto">
        <span className="block text-center text-[0.7rem] font-bold tracking-[.12em] uppercase text-[#2a9d8f] mb-3">
          Simple Process
        </span>
        <h2 className="text-center text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-tight text-[#0d1f1c]">
          How It Works
        </h2>
        <p className="text-center mt-3 text-[1.05rem] text-[#6b8280] max-w-[520px] mx-auto">
          Getting your medicines delivered is as easy as three simple steps.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {steps.map((step) => (
            <div
              key={step.num}
              className={`animate-fade-in-up ${step.delay} bg-white rounded-3xl border border-[#e2efed] p-6 pb-8 flex flex-col group transition-all duration-300 hover:shadow-[0_20px_50px_rgba(42,157,143,0.1)] hover:-translate-y-1`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={step.img}
                alt={step.title}
                className="w-full aspect-square object-cover rounded-2xl bg-[#f0fbf9] mb-6 transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[0.7rem] font-extrabold tracking-[.1em] text-[#2a9d8f]">
                  {step.num}
                </span>
                <div className="flex-1 h-px bg-[#e2efed]" />
              </div>
              <div className="text-[1.15rem] font-bold text-[#0d1f1c] mb-2">
                {step.title}
              </div>
              <p className="text-sm text-[#6b8280] leading-[1.7]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
