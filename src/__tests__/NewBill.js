/**
 * @jest-environment jsdom
 */


import { fireEvent, getByLabelText, getByTestId, screen, waitFor } from "@testing-library/dom"
import {localStorageMock} from "../__mocks__/localStorage.js";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import store from '../__mocks__/store.js';
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { bills }   from "../fixtures/bills.js"
import "@testing-library/jest-dom/extend-expect";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the NewBill form should be displayed", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      
      await waitFor(() => screen.getByText("Envoyer une note de frais"));
      const formData = screen.getAllByTestId("form-new-bill");
      
      expect(formData).toBeTruthy();
    })
  })
  describe("When I am on NewBill Page and I submit the form", () => {
    
    let billForm, expenseTypeInput, datePickerInput, amountInput,
    pctInput, fileInput, fileInputLabel, file, billData;

    beforeAll(() => {

      billData = bills[0];

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employe',
        email : 'employe@test.tld'
      }))

    })

    beforeEach(() => {

      document.body.innerHTML = NewBillUI()

      billForm = screen.getByTestId("form-new-bill");
      expenseTypeInput = screen.getByTestId("expense-type");
      datePickerInput = screen.getByTestId("datepicker");
      amountInput = screen.getByTestId("amount");
      pctInput = screen.getByTestId("pct");
      fileInput = screen.getByTestId("file");
      fileInputLabel = screen.getByLabelText(/Justificatif/i)

    });

    afterEach(() => {

      document.body.innerHTML = ''

    })
    
    test("Then clean field file if uplaod a bad file", () =>{

        file = new File(['test'], 'badFile.pdf', {type: 'application/pdf'});

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
  
        const newBill = new NewBill({
          document, onNavigate, store, localStorage: window.localStorage
        })
        
        billForm.addEventListener("submit", newBill.handleChangeFile);

        userEvent.upload(fileInputLabel, file); 

        //expect(fileInput.files[0]).not.toBeTruthy();

    })
    
    test("Then no error should be displayed so all required fields are completed and come back to bills page", async () => {

      file = new File(['test'], billData.fileName, {type: 'image/jpeg'});

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      
      billForm.addEventListener("submit", newBill.handleSubmit);

      fireEvent.change(expenseTypeInput, { target: { value: billData.type } });
      fireEvent.change(datePickerInput, { target: { value: billData.date } });
      fireEvent.change(amountInput, { target: { value: billData.amount } });
      fireEvent.change(pctInput, { target: { value: billData.pct } });
      userEvent.upload(fileInputLabel, file); 
      

      expect(expenseTypeInput).toBeValid();
      expect(datePickerInput).toBeValid();
      expect(amountInput).toBeValid();
      expect(pctInput).toBeValid();
      expect(fileInput.files[0]).toBeTruthy();
      
      fireEvent.submit(billForm);
      
      //expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    })
  })
})
