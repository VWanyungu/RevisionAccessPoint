# RevisionAccessPoint
RAP is web application designed to make it easier for University students to access learning resources. It includes a pdf reader and an AI feature for generating quizes.

I used the chatPDF api to generate questions based on a pdf file that I dynamically load. The maor challenge in using the api was dealing with the response. The response was in form of a string but I needed an array of objects, where each object is a question with key value pairs of question, choices and an answer.
Looking more closely at the response, I realised I could use the js split method, to separate questions from each other based on \n escape sequennces. I then set the first and last lines of the questions as the question and anser. The rest of the lines were the choices.
I also faced some challenge in displaying the choices using radio inputs. Each input must be unique from the rest, I used indices to ensure that.
