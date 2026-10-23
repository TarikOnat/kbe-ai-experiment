import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormField from '@/components/FormField.vue'

describe('FormField', () => {
  it('zeigt im Lesemodus den Wert als Text an', () => {
    const wrapper = mount(FormField, {
      props: { id: 'f', label: 'Geburtsdatum', modelValue: '2002-05-14', type: 'date', editing: false },
    })
    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.text()).toContain('14.05.2002')
  })

  it('zeigt einen Platzhalter für leere Werte', () => {
    const wrapper = mount(FormField, { props: { id: 'f', label: 'Telefon', modelValue: '', editing: false } })
    expect(wrapper.text()).toContain('Keine Angabe')
  })

  it('rendert im Bearbeitungsmodus ein beschriftetes Eingabefeld und emittiert Änderungen', async () => {
    const wrapper = mount(FormField, { props: { id: 'f', label: 'Vorname', modelValue: 'Lena', editing: true } })
    const input = wrapper.find('input')
    expect(wrapper.find('label').attributes('for')).toBe('f')
    await input.setValue('Mia')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Mia'])
  })

  it('wandelt Zahlenfelder in Zahlen um', async () => {
    const wrapper = mount(FormField, {
      props: { id: 'f', label: 'Semester', modelValue: 3, type: 'number', editing: true },
    })
    await wrapper.find('input').setValue('4')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([4])
  })

  it('verknüpft Fehlermeldungen barrierefrei mit dem Feld', () => {
    const wrapper = mount(FormField, {
      props: { id: 'f', label: 'Vorname', modelValue: '', editing: true, error: 'Pflichtfeld' },
    })
    const input = wrapper.find('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('f-error')
    expect(wrapper.find('#f-error').text()).toContain('Pflichtfeld')
  })

  it('bleibt bei gesperrten Feldern auch im Bearbeitungsmodus schreibgeschützt', () => {
    const wrapper = mount(FormField, {
      props: { id: 'f', label: 'Matrikelnummer', modelValue: '0587412', editing: true, locked: true },
    })
    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.text()).toContain('0587412')
  })
})
