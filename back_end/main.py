from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from basic_functions.operation_router import router as operation_router
from discovery_functions.discovery_router import router as discovery_router
from my_functions.my_router import router as my_router
from rank_functions.rank_router import router as rank_router

app = FastAPI()
origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # 可以访问的域名列表
    allow_credentials=True,      # 是否允许携带cookie
    allow_methods=["*"],         # 允许所有方法
    allow_headers=["*"],         # 允许所有请求头
)

app.include_router(operation_router, prefix="", tags=["basic_functions"])
app.include_router(discovery_router, prefix="/recommendation", tags=["discovery_functions"])
app.include_router(my_router, prefix="/my", tags=["my_functions"])
app.include_router(rank_router, prefix="/rank", tags=["rank_functions"])


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
