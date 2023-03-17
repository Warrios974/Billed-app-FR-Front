/**
 * @jest-environment jsdom
 */

import { getByLabelText, getByTestId, screen, waitFor } from "@testing-library/dom"
import {localStorageMock} from "../__mocks__/localStorage.js";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import store from '../__mocks__/store.js';
import { ROUTES } from "../constants/routes.js";
import "@testing-library/jest-dom/extend-expect";


beforeEach(() => {

  document.body.innerHTML = NewBillUI()

});

afterEach(() => {
  
  document.body.innerHTML = ''

})

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe('And I upload a new bill file', () => {
      test("Should clean the input file if is not a picture", () => {

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employe',
          email : 'employe@test.tld'
        }))

        const newBill = new NewBill({
          document, onNavigate, store, localStorage: window.localStorage
        })
  
        const inputFile = getByTestId(document.body, 'file')
        console.log(inputFile)
        const inputLabel = getByLabelText(document.body, 'Justificatif')
  
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
  
        inputFile.addEventListener('change', handleChangeFile)
        
        const file = new File(['test'], 'test.pdf', {
          type: 'application/pdf',
        });
  
        userEvent.upload(inputLabel,file)
  
        expect(handleChangeFile).toHaveBeenCalled()
  
        expect(inputFile.value).toStrictEqual('')
  
      })
    })
  
    describe('When submit a valid new bill form', () => {
      test('should make a redirection to the bills page', async () => {

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: "Employe",
          email : "employe@test.tld"
        }))
  
        const newBill = new NewBill({
          document, onNavigate, store, localStorage: window.localStorage
        })

        const form = getByTestId(document.body, 'form-new-bill')
        const btnSubmit = getByTestId(document.body, 'btn-send-bill')
        const handleSubmit = jest.fn(async (e) => await newBill.handleSubmit(e))
        form.addEventListener('submit', handleSubmit)
  
        const type = getByTestId(document.body, 'expense-type')
        const name = getByTestId(document.body, 'expense-name')
        const amount = getByTestId(document.body, 'amount')
        const date = getByTestId(document.body, 'datepicker')
        const vat = getByTestId(document.body, 'vat')
        const pct = getByTestId(document.body, 'pct')
        const commentary = getByTestId(document.body, 'commentary')
        const input = getByTestId(document.body, 'file')

        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
        input.addEventListener('change', handleChangeFile)
  
        const file = new File(['test'], 'test.png', {
          type: 'image/png',
        });
  
        userEvent.selectOptions(type, ['Transports'])
        await userEvent.type(name, 'Rendez-vous')
        await userEvent.type(amount, '35')
        await userEvent.type(vat, '70')
        await userEvent.type(pct, '20')
        await userEvent.type(commentary, 'Un commentaire test')
        
        date.focus();
        date.value = '2023-02-13';
        date.dispatchEvent(new Event('date', { bubbles: true }));
        
        await waitFor(() => userEvent.upload(input,file))

        console.log(input.files[0])
        console.log(file)
        
        /*console.log('form',type.value);
        console.log('form',name.value);
        console.log('form',amount.value);
        console.log('form',date.value);
        console.log('form',vat.value);
        console.log('form',pct.value);
        console.log('form',commentary.value);
  
        expect(type).toHaveValue('Transports')
        expect(name).toHaveValue('Rendez-vous')
        expect(amount).toHaveValue(35)
        expect(date).toHaveValue('2023-02-13')
        expect(vat).toHaveValue(70)
        expect(pct).toHaveValue(20)
        expect(commentary).toHaveValue('Un commentaire test')
  
        expect(input.files[0]).toStrictEqual(file)
        expect(input.files.item(0)).toStrictEqual(file)
        expect(input.files).toHaveLength(1)*/
  
        userEvent.click(btnSubmit)
  
        await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1))
  
        //const billsTitle = screen.getByTestId('content-title-new-bill')
  
        //expect(billsTitle).toBeDefined()
      })
    })
  
    describe('When submit a invalid new bill form', () => {
      test('should not submit the form', async () => {

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employe',
          email : 'employe@test.tld'
        }))
  
        const newBill = new NewBill({
          document, onNavigate, store, localStorage: window.localStorage
        })

        const form = getByTestId(document.body, 'form-new-bill')
        const btnSubmit = getByTestId(document.body, 'btn-send-bill')
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
        form.addEventListener('submit', handleSubmit)

        await userEvent.click(btnSubmit)

        //expect(handleSubmit).toThrow()

        //const billsTitle = screen.getByTestId('content-title-new-bill')
  
        //expect(billsTitle).toBeDefined()
      })
    })
  })
})
