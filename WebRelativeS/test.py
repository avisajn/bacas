#! /usr/bin/env python  
#coding=utf-8  

import base64
from Crypto.Cipher import DES
from Crypto import Random

import pyDes


# code = 'bgeL2RrHyM3WVSiIh5TLnE5Xk6RmD7Dvbjur/NHRESmTl/sbSxxGLTS+3w8l4EmIwz5ZOHO40lTzMcCx0FbIEXaxVGEsW3YcYNjfWjkTe3HSHss+B2L9fA==';
code = 'ELu6CrmYkEsLN4ccxqfXKyvSXJU9uAzm';
# code = 'ELu6CrmYkEsKdUDxb9PxGMEDlLkJhbtJ';
# code = 'ELu6CrmYkEvJgmqL4gVD461UrPBPiHoAfhJjO2/82Fa1y5qeTLu/NMoGZlmU1APPkuP3Ui+x5cO8bi1PqBagSw==';
code = base64.b64decode(code)
des = pyDes.des("bacanews", pyDes.ECB, padmode=pyDes.PAD_PKCS5)
print(des.decrypt(code))