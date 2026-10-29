"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Check } from "lucide-react";

export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="border-y border-[#e7e5df] bg-[#f2f1eb] px-5 py-14 text-center sm:py-20" id="journal">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#987760]">Письма от mimo</p>
      <h2 className="font-serif text-3xl tracking-[-0.04em] sm:text-4xl">Немного хорошего в почте</h2>
      <p className="mx-auto mt-3 max-w-[410px] text-sm leading-6 text-[#777d72]">Новинки, идеи для уютных дней и маленькие радости — без лишнего шума.</p>
      {submitted ? (
        <p className="mt-7 inline-flex items-center gap-2 text-sm text-[#52644f]">
          <Check size={17} /> Форма подписки будет подключена перед запуском магазина.
        </p>
      ) : (
        <form className="mx-auto mt-7 flex max-w-[440px] gap-2" onSubmit={subscribe}>
          <input aria-label="Ваш e-mail" className="min-w-0 flex-1 border border-[#d9dacf] bg-[#faf9f6] px-4 py-3 text-sm outline-none placeholder:text-[#96998f] focus:border-[#65755e]" placeholder="Ваш e-mail" required type="email" />
          <button className="bg-[#26352c] px-5 text-[10px] uppercase tracking-[0.1em] text-white">Подписаться</button>
        </form>
      )}
    </section>
  );
}
