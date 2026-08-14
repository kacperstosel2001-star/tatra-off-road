'use client'

import React, { createContext, useContext } from 'react'
import type { ContactInfoDTO } from '@/types/payload'

const defaults: ContactInfoDTO = {
  address: 'Ul. Świętej Anny 39, 34-521 Ząb',
  phones: ['+48 888 254 223', '+48 530 198 735'],
  email: 'tatraoffroad@gmail.com',
  hours: 'Wyprawy codziennie, 8:00–20:00, po rezerwacji',
  whatsapp: '+48 888 254 223',
}

const ContactContext = createContext<ContactInfoDTO>(defaults)

export function ContactProvider({
  value,
  children,
}: {
  value: ContactInfoDTO
  children: React.ReactNode
}) {
  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
}

/** Shared contact from Payload → Strony → Dane kontaktowe (edit once). */
export function useContact() {
  return useContext(ContactContext)
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[\s()-]/g, '')}`
}

export function waHref(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}`
}
