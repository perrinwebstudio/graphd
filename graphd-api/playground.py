# class MyClass:
#     def __init__(self, **kwargs):
#         for key, value in kwargs.items():
#             setattr(self, key, value)

#     def map(self, transform_fn: Callable[[str, any], any]):
#         for attr in dir(self):
#             if not attr.startswith("__") and callable(getattr(self, attr)):
#                 transformed_value = transform_fn(attr, getattr(self, attr))
#                 setattr(self, attr, transformed_value)


# my_object = MyClass(name="John", age=25)

# # Define a lambda function to transform the attributes
# transform_fn = lambda x: x

# # Apply the transformation using the map method
# my_object.map(transform_fn)

# # Print the transformed object
# print(my_object.name)  # Output: JOHN
# print(my_object.age)   # Output: 26

# class ChartType(str, Enum):
#     line = "line"
#     bar = "bar"
#     pie = "pie"


# class ChartMetadata(BaseModel):
#     title: str
#     type: ChartType


# chart = ChartMetadata(title="test", type="bar")
# print(chart.type == ChartType.bar)
# import asyncio
# from collections.abc import AsyncGenerator
# async def count_up_to(n: int) -> AsyncGenerator[int, None]:
#     for i in range(1, n + 1):
#         yield i
#         asyncio.sleep(0.1)
#         # time.sleep(0.1)


# async def main():
#     async for number in count_up_to(5):
#         print(number)


# asyncio.run(main())
